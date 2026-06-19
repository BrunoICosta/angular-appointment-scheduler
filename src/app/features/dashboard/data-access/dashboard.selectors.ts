import { Appointment, Service } from '../../../core/models';
import { addDays, isSameDay, startOfDay } from '../../../shared/utils/date-time.utils';

/** Pure derivations used by the dashboard; kept outside the component to be unit-tested. */

export interface DayGroup<T> {
  readonly date: Date;
  readonly items: readonly T[];
}

/** Next scheduled appointments that have not ended yet, soonest first. */
export function upcomingAppointments(
  appointments: readonly Appointment[],
  now: Date,
  limit: number,
): Appointment[] {
  return appointments
    .filter(
      (appointment) =>
        appointment.status === 'scheduled' && new Date(appointment.end).getTime() > now.getTime(),
    )
    .sort((a, b) => a.start.localeCompare(b.start))
    .slice(0, limit);
}

/** Groups items (already sorted) by local calendar day. */
export function groupByDay<T extends Pick<Appointment, 'start'>>(
  items: readonly T[],
): DayGroup<T>[] {
  const groups: { date: Date; items: T[] }[] = [];
  for (const item of items) {
    const start = new Date(item.start);
    const last = groups.at(-1);
    if (last && isSameDay(last.date, start)) {
      last.items.push(item);
    } else {
      groups.push({ date: startOfDay(start), items: [item] });
    }
  }
  return groups;
}

/** Monday 00:00 (inclusive) to next Monday 00:00 (exclusive) of the week containing `date`. */
export function weekRange(date: Date): { start: Date; end: Date } {
  const start = startOfDay(date);
  const daysSinceMonday = (start.getDay() + 6) % 7;
  const monday = addDays(start, -daysSinceMonday);
  return { start: monday, end: addDays(monday, 7) };
}

export function isWithin(appointment: Pick<Appointment, 'start'>, start: Date, end: Date): boolean {
  const time = new Date(appointment.start).getTime();
  return time >= start.getTime() && time < end.getTime();
}

/** Revenue of non-cancelled appointments, using the current price of each service. */
export function expectedRevenue(
  appointments: readonly Appointment[],
  services: ReadonlyMap<string, Pick<Service, 'price'>>,
): number {
  return appointments
    .filter((appointment) => appointment.status !== 'cancelled')
    .reduce((total, appointment) => total + (services.get(appointment.serviceId)?.price ?? 0), 0);
}
