import { SEED_CLIENTS, SEED_PROFESSIONALS, SEED_SERVICES } from '../../../core/data/seed';
import { Appointment, AppointmentStatus, Professional } from '../../../core/models';
import { toBusinessHours, toCalendarEvents } from './calendar-events';

const lookups = {
  professionals: new Map(SEED_PROFESSIONALS.map((p) => [p.id, p])),
  clients: new Map(SEED_CLIENTS.map((c) => [c.id, c])),
  services: new Map(SEED_SERVICES.map((s) => [s.id, s])),
};

const appointment = (status: AppointmentStatus): Appointment => ({
  id: `a-${status}`,
  professionalId: 'pro-ana',
  clientId: 'cli-mariana',
  serviceId: 'svc-haircut',
  start: '2026-06-16T13:00:00.000Z',
  end: '2026-06-16T14:00:00.000Z',
  status,
});

describe('toCalendarEvents', () => {
  it('maps appointments to colored events titled with client and service', () => {
    const [event] = toCalendarEvents([appointment('scheduled')], lookups);
    expect(event).toEqual(
      jasmine.objectContaining({
        id: 'a-scheduled',
        title: 'Mariana Costa · Corte feminino',
        backgroundColor: '#e11d48',
        editable: true,
        classNames: ['fc-event--scheduled'],
      }),
    );
  });

  it('locks completed and cancelled appointments', () => {
    const events = toCalendarEvents([appointment('completed'), appointment('cancelled')], lookups);
    expect(events.map((event) => event.editable)).toEqual([false, false]);
  });
});

describe('toBusinessHours', () => {
  const professional = (id: string, monday: [string, string] | null): Professional => ({
    id,
    name: id,
    specialty: '',
    color: '#000',
    workingHours: [
      null,
      monday ? { start: monday[0], end: monday[1] } : null,
      null,
      null,
      null,
      null,
      null,
    ],
  });

  it('mirrors a single schedule', () => {
    expect(toBusinessHours([professional('a', ['09:00', '18:00'])])).toEqual([
      { daysOfWeek: [1], startTime: '09:00', endTime: '18:00' },
    ]);
  });

  it('uses the widest window when several professionals are shown', () => {
    expect(
      toBusinessHours([
        professional('a', ['09:00', '18:00']),
        professional('b', ['08:00', '17:00']),
        professional('c', null),
      ]),
    ).toEqual([{ daysOfWeek: [1], startTime: '08:00', endTime: '18:00' }]);
  });
});
