import { FormArray, FormControl, FormGroup } from '@angular/forms';

import { atLeastOneWorkingDayValidator, dayScheduleValidator } from './working-hours.validators';

const day = (enabled: boolean, start = '09:00', end = '18:00') =>
  new FormGroup({
    enabled: new FormControl(enabled),
    start: new FormControl(start),
    end: new FormControl(end),
  });

describe('working hours validators', () => {
  describe('dayScheduleValidator (cross-field)', () => {
    it('ignores disabled days', () => {
      expect(dayScheduleValidator(day(false, '', ''))).toBeNull();
    });

    it('requires both times on enabled days', () => {
      expect(dayScheduleValidator(day(true, '', '18:00'))).toEqual({ timeRequired: true });
    });

    it('requires the closing time to be after the opening time', () => {
      expect(dayScheduleValidator(day(true, '18:00', '09:00'))).toEqual({ timeRange: true });
      expect(dayScheduleValidator(day(true, '09:00', '09:00'))).toEqual({ timeRange: true });
      expect(dayScheduleValidator(day(true))).toBeNull();
    });
  });

  describe('atLeastOneWorkingDayValidator', () => {
    it('fails when every day is disabled', () => {
      const week = new FormArray([day(false), day(false)]);
      expect(atLeastOneWorkingDayValidator(week)).toEqual({ noWorkingDays: true });
    });

    it('passes with at least one enabled day', () => {
      const week = new FormArray([day(false), day(true)]);
      expect(atLeastOneWorkingDayValidator(week)).toBeNull();
    });
  });
});
