import { FormControl } from '@angular/forms';

import { cpfValidator, isValidCpf } from './cpf.validator';

describe('isValidCpf', () => {
  it('accepts valid CPFs with or without mask', () => {
    expect(isValidCpf('529.982.247-25')).toBeTrue();
    expect(isValidCpf('52998224725')).toBeTrue();
    expect(isValidCpf('153.509.460-56')).toBeTrue();
  });

  it('rejects wrong check digits', () => {
    expect(isValidCpf('529.982.247-24')).toBeFalse();
    expect(isValidCpf('529.982.247-35')).toBeFalse();
  });

  it('rejects repeated sequences even though they pass the checksum', () => {
    expect(isValidCpf('111.111.111-11')).toBeFalse();
    expect(isValidCpf('00000000000')).toBeFalse();
  });

  it('rejects inputs that do not have 11 digits', () => {
    expect(isValidCpf('529.982.247-2')).toBeFalse();
    expect(isValidCpf('529982247250')).toBeFalse();
    expect(isValidCpf('')).toBeFalse();
    expect(isValidCpf(null)).toBeFalse();
  });

  it('handles a check digit that resolves to zero', () => {
    // Remainder 10 must become 0 for the first digit.
    expect(isValidCpf('714.602.380-01')).toBeTrue();
  });
});

describe('cpfValidator', () => {
  it('ignores empty values so `required` can report them', () => {
    expect(cpfValidator(new FormControl(''))).toBeNull();
    expect(cpfValidator(new FormControl(null))).toBeNull();
  });

  it('returns a `cpf` error for invalid values', () => {
    expect(cpfValidator(new FormControl('123.456.789-00'))).toEqual({ cpf: true });
    expect(cpfValidator(new FormControl(12345678900))).toEqual({ cpf: true });
  });

  it('returns null for valid values', () => {
    expect(cpfValidator(new FormControl('390.533.447-05'))).toBeNull();
  });
});
