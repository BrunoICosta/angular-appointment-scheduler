import { fakeAsync, tick } from '@angular/core/testing';
import { FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';

import { Appointment, AppointmentStatus, Professional } from '../../../core/models';
import {
  AvailabilityChecker,
  OVERLAP_CHECK_DEBOUNCE_MS,
  endAfterStartValidator,
  noOverlapValidator,
  notInPastValidator,
  readSlot,
  withinWorkingHoursValidator,
} from './appointment.validators';

const professional: Professional = {
  id: 'pro-1',
  name: 'Carlos',
  specialty: 'Fisioterapeuta',
  color: '#0d9488',
  workingHours: [null, ...Array(5).fill({ start: '08:00', end: '17:00' }), null],
};

/** Monday 2026-06-15 at 08:00. */
const now = () => new Date(2026, 5, 15, 8, 0);

function buildForm(value: {
  date?: string;
  startTime?: string;
  endTime?: string;
  status?: AppointmentStatus;
  professionalId?: string;
}) {
  return new FormGroup({
    professionalId: new FormControl(value.professionalId ?? 'pro-1', { nonNullable: true }),
    date: new FormControl(value.date ?? '2026-06-15', { nonNullable: true }),
    startTime: new FormControl(value.startTime ?? '10:00', { nonNullable: true }),
    endTime: new FormControl(value.endTime ?? '11:00', { nonNullable: true }),
    status: new FormControl<AppointmentStatus>(value.status ?? 'scheduled', { nonNullable: true }),
  });
}

describe('appointment validators', () => {
  it('readSlot builds dates from the form and returns null when incomplete', () => {
    expect(readSlot(buildForm({}))).toEqual({
      start: new Date(2026, 5, 15, 10, 0),
      end: new Date(2026, 5, 15, 11, 0),
    });
    expect(readSlot(buildForm({ startTime: '' }))).toBeNull();
  });

  describe('endAfterStartValidator (cross-field)', () => {
    it('flags an end time before or equal to the start time', () => {
      expect(endAfterStartValidator(buildForm({ startTime: '11:00', endTime: '10:00' }))).toEqual({
        endBeforeStart: true,
      });
      expect(endAfterStartValidator(buildForm({ startTime: '11:00', endTime: '11:00' }))).toEqual({
        endBeforeStart: true,
      });
    });

    it('accepts a proper range and incomplete forms', () => {
      expect(endAfterStartValidator(buildForm({}))).toBeNull();
      expect(endAfterStartValidator(buildForm({ endTime: '' }))).toBeNull();
    });

    it('re-validates when either field changes', () => {
      const form = buildForm({ startTime: '11:00', endTime: '10:00' });
      form.addValidators(endAfterStartValidator);
      form.updateValueAndValidity();
      expect(form.hasError('endBeforeStart')).toBeTrue();

      form.controls.endTime.setValue('12:00');
      expect(form.hasError('endBeforeStart')).toBeFalse();
    });
  });

  describe('notInPastValidator', () => {
    it('rejects slots that start before now', () => {
      const validator = notInPastValidator(now);
      expect(validator(buildForm({ startTime: '07:30', endTime: '08:30' }))).toEqual({
        pastSlot: true,
      });
      expect(validator(buildForm({ date: '2026-06-14' }))).toEqual({ pastSlot: true });
    });

    it('accepts future slots', () => {
      expect(notInPastValidator(now)(buildForm({}))).toBeNull();
    });

    it('allows editing a past appointment as long as its start is unchanged', () => {
      const originalStart = new Date(2026, 5, 15, 7, 0).toISOString();
      const validator = notInPastValidator(now, originalStart);
      expect(validator(buildForm({ startTime: '07:00', endTime: '07:45' }))).toBeNull();
      expect(validator(buildForm({ startTime: '07:15', endTime: '08:00' }))).toEqual({
        pastSlot: true,
      });
    });

    it('skips cancelled appointments', () => {
      expect(
        notInPastValidator(now)(buildForm({ startTime: '06:00', status: 'cancelled' })),
      ).toBeNull();
    });
  });

  describe('withinWorkingHoursValidator', () => {
    const validator = withinWorkingHoursValidator((id) =>
      id === professional.id ? professional : undefined,
    );

    it('accepts slots inside the working hours', () => {
      expect(validator(buildForm({ startTime: '08:00', endTime: '17:00' }))).toBeNull();
    });

    it('reports the opening hours when the slot is outside them', () => {
      expect(validator(buildForm({ startTime: '16:30', endTime: '17:30' }))).toEqual({
        outsideWorkingHours: { name: 'Carlos', start: '08:00', end: '17:00' },
      });
    });

    it('reports days off', () => {
      // 2026-06-20 is a Saturday
      expect(validator(buildForm({ date: '2026-06-20' }))).toEqual({ dayOff: { name: 'Carlos' } });
    });

    it('does nothing until a known professional is selected', () => {
      expect(validator(buildForm({ professionalId: '' }))).toBeNull();
      expect(validator(buildForm({ professionalId: 'unknown' }))).toBeNull();
    });
  });

  describe('noOverlapValidator (async)', () => {
    const conflict: Appointment = {
      id: 'a-9',
      professionalId: 'pro-1',
      clientId: 'cli-1',
      serviceId: 'svc-1',
      start: new Date(2026, 5, 15, 10, 30).toISOString(),
      end: new Date(2026, 5, 15, 11, 30).toISOString(),
      status: 'scheduled',
    };

    function checker(result: Appointment[]) {
      return jasmine
        .createSpyObj<AvailabilityChecker>('AvailabilityChecker', ['findConflicts'])
        .findConflicts.and.returnValue(of(result));
    }

    function run(validatorResult: Observable<ValidationErrors | null>) {
      let result: ValidationErrors | null | undefined;
      validatorResult.subscribe((value) => (result = value));
      return () => result;
    }

    it('reports the conflicting time range after the debounce', fakeAsync(() => {
      const findConflicts = checker([conflict]);
      const validator = noOverlapValidator({ findConflicts }, 'a-1');
      const result = run(validator(buildForm({})) as Observable<ValidationErrors | null>);

      tick(OVERLAP_CHECK_DEBOUNCE_MS - 1);
      expect(findConflicts).not.toHaveBeenCalled();
      expect(result()).toBeUndefined();

      tick(1);
      expect(findConflicts).toHaveBeenCalledOnceWith(
        'pro-1',
        { start: new Date(2026, 5, 15, 10, 0), end: new Date(2026, 5, 15, 11, 0) },
        'a-1',
      );
      expect(result()).toEqual({ overlap: { start: '10:30', end: '11:30' } });
    }));

    it('returns null when the professional is free', fakeAsync(() => {
      const validator = noOverlapValidator({ findConflicts: checker([]) });
      const result = run(validator(buildForm({})) as Observable<ValidationErrors | null>);
      tick(OVERLAP_CHECK_DEBOUNCE_MS);
      expect(result()).toBeNull();
    }));

    it('skips the lookup for incomplete or cancelled appointments', fakeAsync(() => {
      const findConflicts = checker([conflict]);
      const validator = noOverlapValidator({ findConflicts });
      const incomplete = run(
        validator(buildForm({ endTime: '' })) as Observable<ValidationErrors | null>,
      );
      const cancelled = run(
        validator(buildForm({ status: 'cancelled' })) as Observable<ValidationErrors | null>,
      );
      tick(OVERLAP_CHECK_DEBOUNCE_MS);
      expect(incomplete()).toBeNull();
      expect(cancelled()).toBeNull();
      expect(findConflicts).not.toHaveBeenCalled();
    }));

    it('drives the form through PENDING to INVALID', fakeAsync(() => {
      const form = buildForm({});
      form.addAsyncValidators(noOverlapValidator({ findConflicts: checker([conflict]) }));
      form.updateValueAndValidity();
      expect(form.status).toBe('PENDING');

      tick(OVERLAP_CHECK_DEBOUNCE_MS);
      expect(form.status).toBe('INVALID');
      expect(form.hasError('overlap')).toBeTrue();
    }));
  });
});
