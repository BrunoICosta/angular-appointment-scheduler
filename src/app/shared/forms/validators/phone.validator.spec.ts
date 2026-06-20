import { FormControl } from '@angular/forms';

import { isValidBrazilianPhone, phoneValidator } from './phone.validator';

describe('isValidBrazilianPhone', () => {
  it('accepts mobile numbers (11 digits starting with 9)', () => {
    expect(isValidBrazilianPhone('(11) 98765-4321')).toBeTrue();
    expect(isValidBrazilianPhone('21998123344')).toBeTrue();
  });

  it('accepts landlines (10 digits starting with 2-5)', () => {
    expect(isValidBrazilianPhone('(11) 3456-7890')).toBeTrue();
    expect(isValidBrazilianPhone('4132221111')).toBeTrue();
  });

  it('rejects mobiles without the leading 9', () => {
    expect(isValidBrazilianPhone('(11) 88765-4321')).toBeFalse();
  });

  it('rejects landlines starting with an invalid digit', () => {
    expect(isValidBrazilianPhone('(11) 8456-7890')).toBeFalse();
    expect(isValidBrazilianPhone('(11) 1456-7890')).toBeFalse();
  });

  it('rejects area codes containing zero', () => {
    expect(isValidBrazilianPhone('(01) 98765-4321')).toBeFalse();
    expect(isValidBrazilianPhone('(10) 98765-4321')).toBeFalse();
  });

  it('rejects incomplete or too long numbers', () => {
    expect(isValidBrazilianPhone('(11) 9876-543')).toBeFalse();
    expect(isValidBrazilianPhone('119876543210')).toBeFalse();
    expect(isValidBrazilianPhone(undefined)).toBeFalse();
  });
});

describe('phoneValidator', () => {
  it('leaves empty values to `required`', () => {
    expect(phoneValidator(new FormControl(''))).toBeNull();
  });

  it('flags invalid numbers with a `phone` error', () => {
    expect(phoneValidator(new FormControl('(11) 1234'))).toEqual({ phone: true });
  });

  it('accepts valid numbers', () => {
    expect(phoneValidator(new FormControl('(85) 98877-6655'))).toBeNull();
  });
});
