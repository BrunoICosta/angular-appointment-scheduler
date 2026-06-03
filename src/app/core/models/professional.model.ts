import { Entity } from './entity.model';

/** 0 = Sunday ... 6 = Saturday, aligned with `Date.prototype.getDay()`. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const WEEKDAYS: readonly Weekday[] = [0, 1, 2, 3, 4, 5, 6];

/** Opening interval of a single day, using 24h `HH:mm` strings. */
export interface DaySchedule {
  readonly start: string;
  readonly end: string;
}

/** Weekly schedule indexed by weekday. `null` means the professional does not work that day. */
export type WorkingHours = readonly (DaySchedule | null)[];

export interface Professional extends Entity {
  readonly name: string;
  readonly specialty: string;
  /** Hex color used to paint the professional's appointments on the calendar. */
  readonly color: string;
  readonly workingHours: WorkingHours;
}
