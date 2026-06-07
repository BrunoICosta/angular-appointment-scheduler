import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

import { onlyDigits } from '../masks/masks';

/**
 * Validates a Brazilian phone number with area code (DDD):
 * - landline: 10 digits, number starting with 2–5, e.g. `(11) 3456-7890`
 * - mobile:   11 digits, number starting with 9,   e.g. `(11) 98765-4321`
 * Area codes never contain a zero (11–99 without 0 in either position).
 */
export function isValidBrazilianPhone(value: string | null | undefined): boolean {
  const digits = onlyDigits(value ?? '');
  const areaCodeIsValid = /^[1-9]{2}/.test(digits);
  if (!areaCodeIsValid) {
    return false;
  }
  if (digits.length === 11) {
    return digits[2] === '9';
  }
  if (digits.length === 10) {
    return /[2-5]/.test(digits[2]);
  }
  return false;
}

/** Reactive-forms validator: empty values are left to `Validators.required`. */
export const phoneValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value: unknown = control.value;
  if (value === null || value === undefined || value === '') {
    return null;
  }
  return typeof value === 'string' && isValidBrazilianPhone(value) ? null : { phone: true };
};
