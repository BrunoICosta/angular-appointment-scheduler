import { Appointment } from '../../../core/models';
import {
  expectedRevenue,
  groupByDay,
  isWithin,
  upcomingAppointments,
  weekRange,
} from './dashboard.selectors';

const appointment = (
  id: string,
  start: Date,
  minutes = 60,
  overrides: Partial<Appointment> = {},
): Appointment => ({
  id,
  professionalId: 'pro-1',
  clientId: 'cli-1',
  serviceId: 'svc-1',
  start: start.toISOString(),
  end: new Date(start.getTime() + minutes * 60_000).toISOString(),
  status: 'scheduled',
  ...overrides,
});

// Wednesday 2026-06-17 at 10:00
const now = new Date(2026, 5, 17, 10, 0);

describe('dashboard selectors', () => {
  describe('upcomingAppointments', () => {
    const list = [
      appointment('later', new Date(2026, 5, 18, 9, 0)),
      appointment('ended', new Date(2026, 5, 17, 8, 0)),
      appointment('in-progress', new Date(2026, 5, 17, 9, 30)),
      appointment('soon', new Date(2026, 5, 17, 11, 0)),
      appointment('cancelled', new Date(2026, 5, 17, 12, 0), 60, { status: 'cancelled' }),
    ];

    it('keeps scheduled appointments that have not ended, sorted by start', () => {
      expect(upcomingAppointments(list, now, 10).map((a) => a.id)).toEqual([
        'in-progress',
        'soon',
        'later',
      ]);
    });

    it('respects the limit', () => {
      expect(upcomingAppointments(list, now, 1).map((a) => a.id)).toEqual(['in-progress']);
    });
  });

  it('groupByDay groups consecutive items by local day', () => {
    const groups = groupByDay([
      appointment('a', new Date(2026, 5, 17, 9, 0)),
      appointment('b', new Date(2026, 5, 17, 15, 0)),
      appointment('c', new Date(2026, 5, 18, 9, 0)),
    ]);
    expect(groups.length).toBe(2);
    expect(groups[0].date).toEqual(new Date(2026, 5, 17));
    expect(groups[0].items.map((a) => a.id)).toEqual(['a', 'b']);
    expect(groups[1].items.map((a) => a.id)).toEqual(['c']);
  });

  it('weekRange spans Monday to the next Monday', () => {
    expect(weekRange(now)).toEqual({ start: new Date(2026, 5, 15), end: new Date(2026, 5, 22) });
    // Sunday belongs to the week that started on the previous Monday
    expect(weekRange(new Date(2026, 5, 21, 20, 0)).start).toEqual(new Date(2026, 5, 15));
  });

  it('isWithin is inclusive at the start and exclusive at the end', () => {
    const { start, end } = weekRange(now);
    expect(isWithin(appointment('a', start), start, end)).toBeTrue();
    expect(isWithin(appointment('b', end), start, end)).toBeFalse();
  });

  it('expectedRevenue sums prices and skips cancelled appointments', () => {
    const prices = new Map([
      ['svc-1', { price: 100 }],
      ['svc-2', { price: 50.5 }],
    ]);
    const list = [
      appointment('a', now),
      appointment('b', now, 60, { serviceId: 'svc-2', status: 'completed' }),
      appointment('c', now, 60, { status: 'cancelled' }),
      appointment('d', now, 60, { serviceId: 'deleted' }),
    ];
    expect(expectedRevenue(list, prices)).toBe(150.5);
  });
});
