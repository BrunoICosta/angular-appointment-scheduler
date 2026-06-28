import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormControlStatus,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslocoPipe, provideTranslocoScope } from '@jsverse/transloco';
import { distinctUntilChanged, map } from 'rxjs';

import {
  APPOINTMENT_STATUSES,
  AppointmentStatus,
  NewEntity,
  Appointment,
} from '../../../../core/models';
import { AppointmentDialogState } from '../../../../core/scheduling/appointment-dialog.service';
import { AvailabilityService } from '../../../../core/scheduling/availability.service';
import { AppointmentsStore } from '../../../../core/stores/appointments.store';
import { ClientsStore } from '../../../../core/stores/clients.store';
import { ProfessionalsStore } from '../../../../core/stores/professionals.store';
import { ServicesStore } from '../../../../core/stores/services.store';
import { CLOCK } from '../../../../core/utils/clock.token';
import { FieldErrorComponent } from '../../../../shared/forms/field-error/field-error.component';
import {
  ValidationMessage,
  describeErrors,
} from '../../../../shared/forms/field-error/validation-message';
import { LocaleCurrencyPipe } from '../../../../shared/pipes/locale-currency.pipe';
import { LocaleDatePipe } from '../../../../shared/pipes/locale-date.pipe';
import { ConfirmService } from '../../../../shared/ui/confirm-dialog/confirm.service';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { ModalComponent } from '../../../../shared/ui/modal/modal.component';
import { ToastService } from '../../../../shared/ui/toast/toast.service';
import {
  addMinutes,
  combineDateTime,
  diffInMinutes,
  minutesToTime,
  timeToMinutes,
  toDateInputValue,
  toTimeInputValue,
} from '../../../../shared/utils/date-time.utils';
import {
  AppointmentFormValue,
  endAfterStartValidator,
  noOverlapValidator,
  notInPastValidator,
  withinWorkingHoursValidator,
} from '../../data-access/appointment.validators';

const DEFAULT_DURATION_MINUTES = 60;

@Component({
  selector: 'app-appointment-dialog',
  imports: [
    ReactiveFormsModule,
    TranslocoPipe,
    ModalComponent,
    FieldErrorComponent,
    IconComponent,
    LocaleCurrencyPipe,
    LocaleDatePipe,
  ],
  // The dialog is opened from several features, so it brings its own translation scope.
  providers: [provideTranslocoScope('appointments')],
  templateUrl: './appointment-dialog.component.html',
  styleUrl: './appointment-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentDialogComponent implements OnInit {
  readonly state = input.required<AppointmentDialogState>();
  readonly closed = output<void>();

  private readonly appointments = inject(AppointmentsStore);
  private readonly professionalsStore = inject(ProfessionalsStore);
  private readonly clientsStore = inject(ClientsStore);
  private readonly servicesStore = inject(ServicesStore);
  private readonly availability = inject(AvailabilityService);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);
  private readonly clock = inject(CLOCK);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly professionals = this.professionalsStore.sorted;
  protected readonly clients = this.clientsStore.sorted;
  protected readonly services = this.servicesStore.sorted;
  protected readonly statuses = APPOINTMENT_STATUSES;

  protected readonly form = inject(NonNullableFormBuilder).group({
    professionalId: ['', Validators.required],
    clientId: ['', Validators.required],
    serviceId: ['', Validators.required],
    date: ['', Validators.required],
    startTime: ['', Validators.required],
    endTime: ['', Validators.required],
    status: ['scheduled' as AppointmentStatus, Validators.required],
    notes: ['', Validators.maxLength(300)],
  });

  /** Form status/value mirrored into signals so the OnPush template reacts to async validation. */
  protected readonly status = signal<FormControlStatus>(this.form.status);
  protected readonly slotError = signal<ValidationMessage | null>(null);
  protected readonly value = signal<AppointmentFormValue>(this.form.getRawValue());

  protected readonly isEdit = computed(() => this.state().mode === 'edit');
  protected readonly selectedService = computed(() =>
    this.servicesStore.get(this.value().serviceId),
  );
  protected readonly selectedProfessional = computed(() =>
    this.professionalsStore.get(this.value().professionalId),
  );
  protected readonly startDate = computed(() =>
    combineDateTime(this.value().date, this.value().startTime),
  );

  ngOnInit(): void {
    const state = this.state();
    const editing = state.mode === 'edit' ? state.appointment : null;

    this.form.addValidators([
      endAfterStartValidator,
      notInPastValidator(this.clock, editing?.start),
      withinWorkingHoursValidator((id) => this.professionalsStore.get(id)),
    ]);
    this.form.addAsyncValidators(noOverlapValidator(this.availability, editing?.id));

    this.form.reset(
      state.mode === 'edit' ? this.fromAppointment(state.appointment) : this.fromDraft(state),
    );
    this.keepEndTimeInSync();

    this.form.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.status.set(this.form.status);
      this.value.set(this.form.getRawValue());
      this.slotError.set(describeErrors(this.form.errors));
    });
    this.form.updateValueAndValidity();
  }

  protected submit(): void {
    if (this.form.invalid || this.form.pending) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const start = combineDateTime(value.date, value.startTime);
    const end = combineDateTime(value.date, value.endTime);
    if (!start || !end) {
      return;
    }
    const notes = value.notes.trim();
    const payload: NewEntity<Appointment> = {
      professionalId: value.professionalId,
      clientId: value.clientId,
      serviceId: value.serviceId,
      start: start.toISOString(),
      end: end.toISOString(),
      status: value.status,
      ...(notes ? { notes } : {}),
    };
    const clientName = this.clientsStore.get(value.clientId)?.name ?? '';
    const state = this.state();
    if (state.mode === 'edit') {
      this.appointments.update(state.appointment.id, payload);
      this.toast.success('appointments.updated', { name: clientName });
    } else {
      this.appointments.add(payload);
      this.toast.success('appointments.created', { name: clientName });
    }
    this.closed.emit();
  }

  protected async remove(): Promise<void> {
    const state = this.state();
    if (state.mode !== 'edit') {
      return;
    }
    const confirmed = await this.confirm.confirm({
      title: 'appointments.deleteTitle',
      message: 'appointments.deleteMessage',
      confirmLabel: 'common.delete',
      danger: true,
    });
    if (confirmed) {
      this.appointments.remove(state.appointment.id);
      this.toast.success('appointments.deleted');
      this.closed.emit();
    }
  }

  /**
   * Picking a service sets the end time from its duration; moving the start time keeps the
   * current duration. The end time stays editable for custom lengths.
   */
  private keepEndTimeInSync(): void {
    const { serviceId, startTime, endTime } = this.form.controls;

    serviceId.valueChanges
      .pipe(distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((id) => {
        const service = this.servicesStore.get(id);
        const start = timeToMinutes(startTime.value);
        if (service && !Number.isNaN(start)) {
          endTime.setValue(minutesToTime(Math.min(start + service.durationMinutes, 24 * 60)));
        }
      });

    let previousStart = startTime.value;
    startTime.valueChanges
      .pipe(
        map((value) => [previousStart, value] as const),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(([before, after]) => {
        previousStart = after;
        const duration = timeToMinutes(endTime.value) - timeToMinutes(before);
        const start = timeToMinutes(after);
        if (!Number.isNaN(start) && duration > 0) {
          endTime.setValue(minutesToTime(Math.min(start + duration, 24 * 60)));
        }
      });
  }

  private fromAppointment(appointment: Appointment): AppointmentFormValue {
    const start = new Date(appointment.start);
    const end = new Date(appointment.end);
    return {
      professionalId: appointment.professionalId,
      clientId: appointment.clientId,
      serviceId: appointment.serviceId,
      date: toDateInputValue(start),
      startTime: toTimeInputValue(start),
      endTime: toTimeInputValue(end),
      status: appointment.status,
      notes: appointment.notes ?? '',
    };
  }

  private fromDraft(
    state: Extract<AppointmentDialogState, { mode: 'create' }>,
  ): AppointmentFormValue {
    const { draft } = state;
    const service = this.servicesStore.get(draft.serviceId);
    const start = draft.start ?? this.nextHalfHour();
    const duration =
      draft.end && diffInMinutes(start, draft.end) > 0
        ? diffInMinutes(start, draft.end)
        : (service?.durationMinutes ?? DEFAULT_DURATION_MINUTES);
    return {
      professionalId: draft.professionalId ?? '',
      clientId: draft.clientId ?? '',
      serviceId: service?.id ?? '',
      date: toDateInputValue(start),
      startTime: toTimeInputValue(start),
      endTime: toTimeInputValue(addMinutes(start, duration)),
      status: 'scheduled',
      notes: '',
    };
  }

  private nextHalfHour(): Date {
    const now = this.clock();
    const next = new Date(now);
    next.setSeconds(0, 0);
    next.setMinutes(now.getMinutes() < 30 ? 30 : 60);
    return next;
  }
}
