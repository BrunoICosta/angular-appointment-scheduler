import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Flags a CPF already used by another client. The lookup is injected so the validator
 * stays a pure function and can be tested without the store.
 */
export function uniqueCpfValidator(
  isTaken: (cpf: string, exceptId?: string) => boolean,
  exceptId?: string,
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: unknown = control.value;
    if (typeof value !== 'string' || value === '') {
      return null;
    }
    return isTaken(value, exceptId) ? { cpfTaken: true } : null;
  };
}
