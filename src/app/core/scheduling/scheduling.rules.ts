import { Appointment, Professional } from '../models';
import { diffInMinutes, minutesOfDay, timeToMinutes } from '../../shared/utils/date-time.utils';

/**
 * Pure scheduling rules shared by the appointment form validators and the calendar's
 * drag & drop / resize handlers, so both paths enforce exactly the same constraints.
 */

export interface TimeSlot {
  readonly start: Date;
  readonly end: Date;
}

export type WorkingHoursViolation =
  | { readonly reason: 'dayOff' }
  | { readonly reason: 'outsideHours'; readonly start: string; readonly end: string };

export type SlotIssue =
  | { readonly code: 'invalidRange' }
  | { readonly code: 'past' }
  | { readonly code: 'dayOff' }
  | { readonly code: 'outsideHours'; readonly start: string; readonly end: string }
  | { readonly code: 'overlap'; readonly conflicts: readonly Appointment[] };

/** Half-open interval intersection: back-to-back appointments (10:00–11:00, 11:00–12:00) are fine. */
export function overlaps(a: TimeSlot, b: TimeSlot): boolean {
  return a.start.getTime() < b.end.getTime() && b.start.getTime() < a.end.getTime();
}

export function toSlot(appointment: Pick<Appointment, 'start' | 'end'>): TimeSlot {
  return { start: new Date(appointment.start), end: new Date(appointment.end) };
}

/** Active (non-cancelled) appointments of the professional that intersect the slot. */
export function findConflicts(
  appointments: readonly Appointment[],
  professionalId: string,
  slot: TimeSlot,
  excludeId?: string | null,
): Appointment[] {
  return appointments.filter(
    (appointment) =>
      appointment.professionalId === professionalId &&
      appointment.id !== excludeId &&
      appointment.status !== 'cancelled' &&
      overlaps(slot, toSlot(appointment)),
  );
}

/** Checks that the slot fits entirely inside the professional's hours for that weekday. */
export function checkWorkingHours(
  professional: Pick<Professional, 'workingHours'>,
  slot: TimeSlot,
): WorkingHoursViolation | null {
  const schedule = professional.workingHours[slot.start.getDay()];
  if (!schedule) {
    return { reason: 'dayOff' };
  }
  // Measuring the end as start + duration makes slots that cross midnight fail naturally.
  const startMinutes = minutesOfDay(slot.start);
  const endMinutes = startMinutes + diffInMinutes(slot.start, slot.end);
  const fits =
    startMinutes >= timeToMinutes(schedule.start) && endMinutes <= timeToMinutes(schedule.end);
  return fits ? null : { reason: 'outsideHours', start: schedule.start, end: schedule.end };
}

export function isInPast(slot: TimeSlot, now: Date): boolean {
  return slot.start.getTime() < now.getTime();
}

export function isValidRange(slot: TimeSlot): boolean {
  return slot.end.getTime() > slot.start.getTime();
}

export interface SlotValidationContext {
  readonly professional: Pick<Professional, 'id' | 'workingHours'>;
  readonly slot: TimeSlot;
  readonly appointments: readonly Appointment[];
  readonly now: Date;
  /** Appointment being moved/edited, ignored when looking for conflicts. */
  readonly excludeId?: string | null;
}

/** Runs every rule in order of importance and returns the first issue found. */
export function validateSlot(context: SlotValidationContext): SlotIssue | null {
  const { professional, slot, appointments, now, excludeId } = context;
  if (!isValidRange(slot)) {
    return { code: 'invalidRange' };
  }
  if (isInPast(slot, now)) {
    return { code: 'past' };
  }
  const hours = checkWorkingHours(professional, slot);
  if (hours?.reason === 'dayOff') {
    return { code: 'dayOff' };
  }
  if (hours?.reason === 'outsideHours') {
    return { code: 'outsideHours', start: hours.start, end: hours.end };
  }
  const conflicts = findConflicts(appointments, professional.id, slot, excludeId);
  return conflicts.length > 0 ? { code: 'overlap', conflicts } : null;
}
