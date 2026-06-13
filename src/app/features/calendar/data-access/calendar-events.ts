import { BusinessHoursInput, EventInput } from '@fullcalendar/core';

import { Appointment, Client, Professional, Service, WEEKDAYS } from '../../../core/models';

export interface CalendarLookups {
  readonly professionals: ReadonlyMap<string, Professional>;
  readonly clients: ReadonlyMap<string, Client>;
  readonly services: ReadonlyMap<string, Service>;
}

/** Converts appointments into FullCalendar events, painted with the professional's color. */
export function toCalendarEvents(
  appointments: readonly Appointment[],
  lookups: CalendarLookups,
): EventInput[] {
  return appointments.map((appointment) => {
    const professional = lookups.professionals.get(appointment.professionalId);
    const client = lookups.clients.get(appointment.clientId);
    const service = lookups.services.get(appointment.serviceId);
    const color = professional?.color ?? '#64748b';
    const isCancelled = appointment.status === 'cancelled';

    return {
      id: appointment.id,
      title: [client?.name, service?.name].filter(Boolean).join(' · '),
      start: appointment.start,
      end: appointment.end,
      backgroundColor: color,
      borderColor: color,
      textColor: '#ffffff',
      // Cancelled appointments stay visible for history but cannot be moved.
      editable: !isCancelled,
      classNames: [`fc-event--${appointment.status}`],
      extendedProps: { status: appointment.status, professionalName: professional?.name },
    };
  });
}

/**
 * Business hours shown as the white (non-shaded) area of the time grid.
 * With a single professional selected it mirrors their schedule; otherwise it is the
 * union of everyone's days, using the earliest start and latest end of each day.
 */
export function toBusinessHours(professionals: readonly Professional[]): BusinessHoursInput {
  return WEEKDAYS.flatMap((weekday) => {
    const days = professionals
      .map((professional) => professional.workingHours[weekday])
      .filter((day) => day !== null);
    if (days.length === 0) {
      return [];
    }
    const startTime = days.map((day) => day.start).sort()[0];
    const endTime = days
      .map((day) => day.end)
      .sort()
      .at(-1);
    return [{ daysOfWeek: [weekday], startTime, endTime }];
  });
}
