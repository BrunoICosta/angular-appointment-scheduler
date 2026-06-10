import { Weekday } from '../../core/models';

/**
 * A fixed date that falls on the given weekday (2023-01-01 was a Sunday). Used only to let
 * `formatDate` produce localized weekday names, e.g. `{{ weekdayDate(1) | localeDate: 'EEE' }}`.
 */
export function weekdayDate(weekday: Weekday): Date {
  return new Date(2023, 0, 1 + weekday);
}

/** Display order starting on Monday, as is customary in Brazil. */
export const WEEKDAYS_FROM_MONDAY: readonly Weekday[] = [1, 2, 3, 4, 5, 6, 0];
