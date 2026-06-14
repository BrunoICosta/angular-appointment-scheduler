import { AbstractControl, AsyncValidatorFn, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Observable, map, of, switchMap, take, timer } from 'rxjs';

import { Appointment, AppointmentStatus, Professional } from '../../../core/models';
import {
  TimeSlot,
  checkWorkingHours,
  isInPast,
  isValidRange,
} from '../../../core/scheduling/scheduling.rules';
import { Clock } from '../../../core/utils/clock.token';
import { combineDateTime, toTimeInputValue } from '../../../shared/utils/date-time.utils';

/** Raw value of the appointment form group. */
export interface AppointmentFormValue {
  readonly professionalId: string;
  readonly clientId: string;
  readonly serviceId: string;
  /** `yyyy-MM-dd` */
  readonly date: string;
  /** `HH:mm` */
  readonly startTime: string;
  /** `HH:mm` */
  readonly endTime: string;
  readonly status: AppointmentStatus;
  readonly notes: string;
}

/** Debounce applied before the (simulated remote) availability check. */
export const OVERLAP_CHECK_DEBOUNCE_MS = 250;

/** Builds the time slot described by the form, or `null` while date/times are incomplete. */
export function readSlot(group: AbstractControl): TimeSlot | null {
  const value = group.value as Partial<AppointmentFormValue>;
  const start = combineDateTime(value.date, value.startTime);
  const end = combineDateTime(value.date, value.endTime);
  return start && end ? { start, end } : null;
}

/** Cancelled appointments keep their history and are exempt from scheduling rules. */
function isCancelled(group: AbstractControl): boolean {
  return (group.value as Partial<AppointmentFormValue>).status === 'cancelled';
}

/** Cross-field: the end time must be after the start time. */
export const endAfterStartValidator: ValidatorFn = (
  group: AbstractControl,
): ValidationErrors | null => {
  const slot = readSlot(group);
  return slot && !isValidRange(slot) ? { endBeforeStart: true } : null;
};

/**
 * Cross-field: new or rescheduled appointments cannot start in the past.
 * When editing, an unchanged start time is accepted so past appointments can still be
 * updated (e.g. marked as completed).
 */
export function notInPastValidator(clock: Clock, originalStart?: string | null): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const slot = readSlot(group);
    if (!slot || isCancelled(group)) {
      return null;
    }
    const unchanged = originalStart && new Date(originalStart).getTime() === slot.start.getTime();
    return !unchanged && isInPast(slot, clock()) ? { pastSlot: true } : null;
  };
}

/** Cross-field: the slot must fit the selected professional's working hours. */
export function withinWorkingHoursValidator(
  getProfessional: (id: string) => Professional | undefined,
): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const slot = readSlot(group);
    const professionalId = (group.value as Partial<AppointmentFormValue>).professionalId;
    const professional = professionalId ? getProfessional(professionalId) : undefined;
    if (!slot || !professional || isCancelled(group) || !isValidRange(slot)) {
      return null;
    }
    const violation = checkWorkingHours(professional, slot);
    if (!violation) {
      return null;
    }
    return violation.reason === 'dayOff'
      ? { dayOff: { name: professional.name } }
      : {
          outsideWorkingHours: {
            name: professional.name,
            start: violation.start,
            end: violation.end,
          },
        };
  };
}

/** Anything able to look up conflicting appointments, e.g. `AvailabilityService`. */
export interface AvailabilityChecker {
  findConflicts(
    professionalId: string,
    slot: TimeSlot,
    excludeId?: string | null,
  ): Observable<Appointment[]>;
}

/**
 * Async: the professional must be free during the slot. Debounced with `timer` so typing
 * a time does not fire one lookup per keystroke; Angular cancels the previous run when the
 * value changes again.
 */
export function noOverlapValidator(
  availability: AvailabilityChecker,
  excludeId?: string | null,
): AsyncValidatorFn {
  return (group: AbstractControl): Observable<ValidationErrors | null> => {
    const slot = readSlot(group);
    const professionalId = (group.value as Partial<AppointmentFormValue>).professionalId;
    if (!slot || !professionalId || isCancelled(group)) {
      return of(null);
    }
    return timer(OVERLAP_CHECK_DEBOUNCE_MS).pipe(
      switchMap(() => availability.findConflicts(professionalId, slot, excludeId)),
      map((conflicts) => {
        const [first] = conflicts;
        return first
          ? {
              overlap: {
                start: toTimeInputValue(new Date(first.start)),
                end: toTimeInputValue(new Date(first.end)),
              },
            }
          : null;
      }),
      take(1),
    );
  };
}
