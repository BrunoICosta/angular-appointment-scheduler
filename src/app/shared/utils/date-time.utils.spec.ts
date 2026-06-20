import {
  addMinutes,
  combineDateTime,
  diffInMinutes,
  minutesToTime,
  timeToMinutes,
  toDateInputValue,
  toTimeInputValue,
} from './date-time.utils';

describe('date-time utils', () => {
  it('converts HH:mm to minutes and back', () => {
    expect(timeToMinutes('09:30')).toBe(570);
    expect(timeToMinutes('24:00')).toBe(1440);
    expect(minutesToTime(570)).toBe('09:30');
    expect(minutesToTime(5)).toBe('00:05');
  });

  it('returns NaN for malformed times', () => {
    expect(timeToMinutes('9h30')).toBeNaN();
    expect(timeToMinutes('25:00')).toBeNaN();
    expect(timeToMinutes('24:30')).toBeNaN();
    expect(timeToMinutes(null)).toBeNaN();
  });

  it('combines date and time inputs into a local Date', () => {
    const date = combineDateTime('2026-06-15', '14:45');
    expect(date).toEqual(new Date(2026, 5, 15, 14, 45));
    expect(combineDateTime('2026-06-15', '')).toBeNull();
    expect(combineDateTime('15/06/2026', '10:00')).toBeNull();
  });

  it('formats dates for native inputs', () => {
    const date = new Date(2026, 0, 5, 8, 7);
    expect(toDateInputValue(date)).toBe('2026-01-05');
    expect(toTimeInputValue(date)).toBe('08:07');
  });

  it('adds and diffs minutes', () => {
    const start = new Date(2026, 5, 15, 10, 0);
    const end = addMinutes(start, 90);
    expect(end).toEqual(new Date(2026, 5, 15, 11, 30));
    expect(diffInMinutes(start, end)).toBe(90);
  });
});
