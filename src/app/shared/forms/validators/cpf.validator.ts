import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

import { onlyDigits } from '../masks/masks';

/** Computes one CPF check digit for the given leading digits (mod 11 algorithm). */
function checkDigit(digits: readonly number[]): number {
  const weightStart = digits.length + 1;
  const sum = digits.reduce((total, digit, index) => total + digit * (weightStart - index), 0);
  const remainder = (sum * 10) % 11;
  return remainder === 10 ? 0 : remainder;
}

/**
 * Validates a Brazilian CPF, with or without mask: it must have 11 digits, must not be a
 * repeated sequence (e.g. `111.111.111-11`, which passes the checksum) and both check
 * digits must match.
 */
export function isValidCpf(value: string | null | undefined): boolean {
  const digits = onlyDigits(value ?? '');
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) {
    return false;
  }
  const numbers = [...digits].map(Number);
  const first = checkDigit(numbers.slice(0, 9));
  const second = checkDigit(numbers.slice(0, 10));
  return first === numbers[9] && second === numbers[10];
}

/** Reactive-forms validator: empty values are left to `Validators.required`. */
export const cpfValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value: unknown = control.value;
  if (value === null || value === undefined || value === '') {
    return null;
  }
  return typeof value === 'string' && isValidCpf(value) ? null : { cpf: true };
};
