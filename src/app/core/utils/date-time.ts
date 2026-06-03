/**
 * Small, dependency-free helpers to move between `Date` objects and the
 * `yyyy-MM-dd` / `HH:mm` strings used by native date and time inputs.
 * All functions work in the browser's local time zone.
 */

const pad = (value: number): string => value.toString().padStart(2, '0');

/** `HH:mm` -> minutes since midnight. Returns `NaN` for malformed input. */
export function timeToMinutes(time: string | null | undefined): number {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time ?? '');
  if (!match) {
    return Number.NaN;
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 24 || minutes > 59 || (hours === 24 && minutes > 0)) {
    return Number.NaN;
  }
  return hours * 60 + minutes;
}

/** Minutes since midnight -> `HH:mm`. */
export function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${pad(hours)}:${pad(minutes)}`;
}

/** Minutes elapsed since local midnight of the given date. */
export function minutesOfDay(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

export function toDateInputValue(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function toTimeInputValue(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Combines `yyyy-MM-dd` and `HH:mm` into a local `Date`, or `null` if either is invalid. */
export function combineDateTime(
  date: string | null | undefined,
  time: string | null | undefined,
): Date | null {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date ?? '');
  const minutes = timeToMinutes(time);
  if (!dateMatch || Number.isNaN(minutes)) {
    return null;
  }
  const [, year, month, day] = dateMatch;
  const result = new Date(Number(year), Number(month) - 1, Number(day), 0, minutes, 0, 0);
  return Number.isNaN(result.getTime()) ? null : result;
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Difference in whole minutes between two dates (`end - start`). */
export function diffInMinutes(start: Date, end: Date): number {
  return Math.round((end.getTime() - start.getTime()) / 60_000);
}
