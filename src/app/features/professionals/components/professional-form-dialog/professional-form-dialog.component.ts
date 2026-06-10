import { ChangeDetectionStrategy, Component, OnInit, inject, input, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';

import { DaySchedule, NewEntity, Professional, WEEKDAYS, Weekday } from '../../../../core/models';
import { FieldErrorComponent } from '../../../../shared/forms/field-error/field-error.component';
import { ModalComponent } from '../../../../shared/ui/modal/modal.component';
import { LocaleDatePipe } from '../../../../shared/pipes/locale-date.pipe';
import { WEEKDAYS_FROM_MONDAY, weekdayDate } from '../../../../shared/utils/weekday.utils';
import {
  DayScheduleFormValue,
  atLeastOneWorkingDayValidator,
  dayScheduleValidator,
} from '../../data-access/working-hours.validators';

export const PROFESSIONAL_COLORS = [
  '#e11d48',
  '#db2777',
  '#7c3aed',
  '#4f46e5',
  '#0284c7',
  '#0d9488',
  '#16a34a',
  '#d97706',
  '#ea580c',
  '#475569',
] as const;

const DEFAULT_DAY: DayScheduleFormValue = { enabled: false, start: '09:00', end: '18:00' };

@Component({
  selector: 'app-professional-form-dialog',
  imports: [
    ReactiveFormsModule,
    TranslocoPipe,
    ModalComponent,
    FieldErrorComponent,
    LocaleDatePipe,
  ],
  templateUrl: './professional-form-dialog.component.html',
  styleUrl: './professional-form-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfessionalFormDialogComponent implements OnInit {
  readonly professional = input<Professional | null>(null);
  readonly save = output<NewEntity<Professional>>();
  readonly closed = output<void>();

  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly colors = PROFESSIONAL_COLORS;
  protected readonly weekdayOrder = WEEKDAYS_FROM_MONDAY;
  protected readonly weekdayDate = weekdayDate;

  /** One row per weekday, indexed by `Weekday` (0 = Sunday). */
  protected readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
    specialty: ['', [Validators.required, Validators.maxLength(60)]],
    color: [PROFESSIONAL_COLORS[3] as string, [Validators.required]],
    workingHours: this.fb.array(
      WEEKDAYS.map((weekday) =>
        this.createDay(
          weekday >= 1 && weekday <= 5 ? { ...DEFAULT_DAY, enabled: true } : DEFAULT_DAY,
        ),
      ),
      { validators: atLeastOneWorkingDayValidator },
    ),
  });

  ngOnInit(): void {
    const professional = this.professional();
    if (!professional) {
      return;
    }
    this.form.patchValue({
      name: professional.name,
      specialty: professional.specialty,
      color: professional.color,
    });
    WEEKDAYS.forEach((weekday) => {
      const day = professional.workingHours[weekday];
      this.day(weekday).setValue(day ? { enabled: true, ...day } : DEFAULT_DAY);
    });
  }

  protected day(weekday: Weekday) {
    return this.form.controls.workingHours.at(weekday);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { name, specialty, color, workingHours } = this.form.getRawValue();
    this.save.emit({
      name: name.trim(),
      specialty: specialty.trim(),
      color,
      workingHours: workingHours.map((day): DaySchedule | null =>
        day.enabled ? { start: day.start, end: day.end } : null,
      ),
    });
  }

  private createDay(value: DayScheduleFormValue) {
    return this.fb.group(
      { enabled: [value.enabled], start: [value.start], end: [value.end] },
      { validators: dayScheduleValidator },
    );
  }
}
