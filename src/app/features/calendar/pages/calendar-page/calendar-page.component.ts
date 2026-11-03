import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { LanguageService } from '../../../../core/i18n/language.service';
import { AppointmentDialogService } from '../../../../core/scheduling/appointment-dialog.service';
import { validateSlot } from '../../../../core/scheduling/scheduling.rules';
import { AppointmentsStore } from '../../../../core/stores/appointments.store';
import { ClientsStore } from '../../../../core/stores/clients.store';
import { ProfessionalsStore } from '../../../../core/stores/professionals.store';
import { ServicesStore } from '../../../../core/stores/services.store';
import { CLOCK } from '../../../../core/utils/clock.token';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { ToastService } from '../../../../shared/ui/toast/toast.service';
import { addMinutes, timeToMinutes } from '../../../../shared/utils/date-time.utils';
import { mediaQuerySignal } from '../../../../shared/utils/media-query.utils';
import { ProfessionalFilterComponent } from '../../components/professional-filter/professional-filter.component';
import { SchedulerCalendarComponent } from '../../components/scheduler-calendar/scheduler-calendar.component';
import {
  AppointmentMove,
  SlotSelection,
} from '../../components/scheduler-calendar/scheduler-calendar.models';
import { toBusinessHours, toCalendarEvents } from '../../data-access/calendar-events';
import { describeSlotIssue } from '../../data-access/slot-issue-message';

const DEFAULT_SLOT_MINUTES = 60;
const DEFAULT_OPENING_TIME = '09:00';

@Component({
  selector: 'app-calendar-page',
  imports: [TranslocoPipe, IconComponent, SchedulerCalendarComponent, ProfessionalFilterComponent],
  templateUrl: './calendar-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarPageComponent {
  private readonly router = inject(Router);
  private readonly appointments = inject(AppointmentsStore);
  private readonly professionalsStore = inject(ProfessionalsStore);
  private readonly clients = inject(ClientsStore);
  private readonly services = inject(ServicesStore);
  private readonly dialog = inject(AppointmentDialogService);
  private readonly toast = inject(ToastService);
  private readonly clock = inject(CLOCK);
  protected readonly language = inject(LanguageService).current;

  /** Bound from the `?professional=` query param (router component input binding). */
  readonly professional = input<string | undefined>();

  protected readonly professionals = this.professionalsStore.sorted;
  /** Touch screens get instructions for tap and long-press instead of click and drag. */
  protected readonly touch = mediaQuerySignal('(pointer: coarse)');

  /** The selected professional, ignoring stale ids in the URL. */
  protected readonly selected = computed(() => this.professionalsStore.get(this.professional()));

  protected readonly events = computed(() => {
    const selectedId = this.selected()?.id;
    const appointments = this.appointments
      .all()
      .filter((appointment) => !selectedId || appointment.professionalId === selectedId);
    return toCalendarEvents(appointments, {
      professionals: this.professionalsStore.byId(),
      clients: this.clients.byId(),
      services: this.services.byId(),
    });
  });

  protected readonly businessHours = computed(() => {
    const selected = this.selected();
    return toBusinessHours(selected ? [selected] : this.professionalsStore.all());
  });

  protected newAppointment(): void {
    this.dialog.openCreate({ professionalId: this.selected()?.id });
  }

  protected editAppointment(id: string): void {
    this.dialog.openEdit(id);
  }

  /**
   * Clicking/dragging over empty slots opens the form pre-filled with that time.
   * In the month view only the day is known, so the professional's opening time is used.
   */
  protected onSlotSelected(selection: SlotSelection): void {
    const professional = this.selected();
    let { start, end } = selection;
    if (selection.allDay) {
      const opening = professional?.workingHours[start.getDay()]?.start ?? DEFAULT_OPENING_TIME;
      start = addMinutes(start, timeToMinutes(opening));
      end = addMinutes(start, DEFAULT_SLOT_MINUTES);
    }
    this.dialog.openCreate({ professionalId: professional?.id, start, end });
  }

  /** Drag & drop and resize go through the same rules as the form, reverting on failure. */
  protected onAppointmentMoved(move: AppointmentMove): void {
    const appointment = this.appointments.get(move.id);
    const professional = this.professionalsStore.get(appointment?.professionalId);
    if (!appointment || !professional) {
      move.revert();
      return;
    }
    const issue = validateSlot({
      professional,
      slot: { start: move.start, end: move.end },
      appointments: this.appointments.all(),
      now: this.clock(),
      excludeId: appointment.id,
    });
    if (issue) {
      move.revert();
      const message = describeSlotIssue(issue, professional.name);
      this.toast.error(message.key, message.params);
      return;
    }
    this.appointments.update(appointment.id, {
      start: move.start.toISOString(),
      end: move.end.toISOString(),
    });
    this.toast.success('calendar.rescheduled', {
      name: this.clients.get(appointment.clientId)?.name ?? '',
    });
  }

  protected selectProfessional(id: string | null): void {
    void this.router.navigate([], {
      queryParams: { professional: id },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
