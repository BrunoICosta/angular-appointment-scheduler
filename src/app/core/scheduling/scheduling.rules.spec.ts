import { Appointment, Professional } from '../models';
import {
  checkWorkingHours,
  findConflicts,
  isInPast,
  overlaps,
  validateSlot,
} from './scheduling.rules';

// Monday 2026-06-15
const at = (hours: number, minutes = 0, day = 15) => new Date(2026, 5, day, hours, minutes);

const professional: Professional = {
  id: 'pro-1',
  name: 'Ana',
  specialty: 'Cabeleireira',
  color: '#e11d48',
  workingHours: [
    null,
    { start: '09:00', end: '18:00' },
    { start: '09:00', end: '18:00' },
    { start: '09:00', end: '18:00' },
    { start: '09:00', end: '18:00' },
    { start: '09:00', end: '18:00' },
    { start: '09:00', end: '13:00' },
  ],
};

const appointment = (overrides: Partial<Appointment>): Appointment => ({
  id: 'a-1',
  professionalId: 'pro-1',
  clientId: 'cli-1',
  serviceId: 'svc-1',
  start: at(10).toISOString(),
  end: at(11).toISOString(),
  status: 'scheduled',
  ...overrides,
});

describe('scheduling rules', () => {
  describe('overlaps', () => {
    it('detects intersecting intervals', () => {
      expect(
        overlaps({ start: at(10), end: at(11) }, { start: at(10, 30), end: at(12) }),
      ).toBeTrue();
      expect(
        overlaps({ start: at(10), end: at(12) }, { start: at(10, 30), end: at(11) }),
      ).toBeTrue();
    });

    it('allows back-to-back intervals', () => {
      expect(overlaps({ start: at(10), end: at(11) }, { start: at(11), end: at(12) })).toBeFalse();
      expect(overlaps({ start: at(11), end: at(12) }, { start: at(10), end: at(11) })).toBeFalse();
    });
  });

  describe('findConflicts', () => {
    const appointments = [
      appointment({ id: 'a-1' }),
      appointment({ id: 'a-2', professionalId: 'pro-2' }),
      appointment({ id: 'a-3', status: 'cancelled' }),
    ];

    it('returns only active appointments of the same professional', () => {
      const conflicts = findConflicts(appointments, 'pro-1', {
        start: at(10, 30),
        end: at(11, 30),
      });
      expect(conflicts.map((a) => a.id)).toEqual(['a-1']);
    });

    it('ignores the appointment being edited', () => {
      const conflicts = findConflicts(appointments, 'pro-1', { start: at(10), end: at(11) }, 'a-1');
      expect(conflicts).toEqual([]);
    });
  });

  describe('checkWorkingHours', () => {
    it('accepts slots fully inside the working day', () => {
      expect(checkWorkingHours(professional, { start: at(9), end: at(18) })).toBeNull();
    });

    it('reports days off', () => {
      // 2026-06-14 is a Sunday
      expect(checkWorkingHours(professional, { start: at(10, 0, 14), end: at(11, 0, 14) })).toEqual(
        {
          reason: 'dayOff',
        },
      );
    });

    it('reports slots that start too early or end too late', () => {
      const expected = { reason: 'outsideHours', start: '09:00', end: '18:00' };
      expect(checkWorkingHours(professional, { start: at(8, 30), end: at(9, 30) })).toEqual(
        jasmine.objectContaining(expected),
      );
      expect(checkWorkingHours(professional, { start: at(17, 30), end: at(18, 15) })).toEqual(
        jasmine.objectContaining(expected),
      );
    });

    it('uses the schedule of the specific weekday', () => {
      // Saturday 2026-06-20 closes at 13:00
      expect(
        checkWorkingHours(professional, { start: at(12, 30, 20), end: at(13, 30, 20) }),
      ).toEqual({ reason: 'outsideHours', start: '09:00', end: '13:00' });
    });

    it('rejects slots crossing midnight', () => {
      const late: Professional = {
        ...professional,
        workingHours: professional.workingHours.map(() => ({ start: '00:00', end: '24:00' })),
      };
      expect(checkWorkingHours(late, { start: at(23), end: at(1, 0, 16) })).not.toBeNull();
    });
  });

  it('isInPast compares the start with now', () => {
    expect(isInPast({ start: at(9), end: at(10) }, at(9, 1))).toBeTrue();
    expect(isInPast({ start: at(9), end: at(10) }, at(8, 59))).toBeFalse();
  });

  describe('validateSlot', () => {
    const base = { professional, appointments: [appointment({})], now: at(8) };

    it('returns null for a valid slot', () => {
      expect(validateSlot({ ...base, slot: { start: at(11), end: at(12) } })).toBeNull();
    });

    it('reports issues in order of importance', () => {
      expect(validateSlot({ ...base, slot: { start: at(12), end: at(11) } })?.code).toBe(
        'invalidRange',
      );
      expect(validateSlot({ ...base, slot: { start: at(7), end: at(8) } })?.code).toBe('past');
      expect(
        validateSlot({ ...base, slot: { start: at(10, 0, 21), end: at(11, 0, 21) } })?.code,
      ).toBe('dayOff');
      expect(validateSlot({ ...base, slot: { start: at(17), end: at(19) } })?.code).toBe(
        'outsideHours',
      );
      expect(validateSlot({ ...base, slot: { start: at(10, 30), end: at(11, 30) } })?.code).toBe(
        'overlap',
      );
    });

    it('lets an appointment be moved within its own slot', () => {
      expect(
        validateSlot({ ...base, slot: { start: at(10, 15), end: at(11, 15) }, excludeId: 'a-1' }),
      ).toBeNull();
    });
  });
});
