import { AbstractControl, FormArray, ValidationErrors, ValidatorFn } from '@angular/forms';

import { timeToMinutes } from '../../../shared/utils/date-time.utils';

/** Raw value of one weekday row in the working-hours editor. */
export interface DayScheduleFormValue {
  readonly enabled: boolean;
  readonly start: string;
  readonly end: string;
}

/**
 * Cross-field validator for a weekday row: when the day is enabled both times are required
 * and the closing time must be after the opening time.
 */
export const dayScheduleValidator: ValidatorFn = (
  group: AbstractControl,
): ValidationErrors | null => {
  const { enabled, start, end } = group.value as DayScheduleFormValue;
  if (!enabled) {
    return null;
  }
  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);
  if (Number.isNaN(startMinutes) || Number.isNaN(endMinutes)) {
    return { timeRequired: true };
  }
  return endMinutes > startMinutes ? null : { timeRange: true };
};

/** Array-level validator: a professional must work at least one day a week. */
export const atLeastOneWorkingDayValidator: ValidatorFn = (
  array: AbstractControl,
): ValidationErrors | null => {
  const days = (array as FormArray).value as DayScheduleFormValue[];
  return days.some((day) => day.enabled) ? null : { noWorkingDays: true };
};
