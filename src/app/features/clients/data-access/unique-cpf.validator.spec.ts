import { FormControl } from '@angular/forms';

import { uniqueCpfValidator } from './unique-cpf.validator';

describe('uniqueCpfValidator', () => {
  const taken = new Set(['52998224725']);
  const isTaken = jasmine
    .createSpy('isTaken')
    .and.callFake((cpf: string) => taken.has(cpf.replace(/\D/g, '')));

  it('flags a CPF already used by another client', () => {
    const validator = uniqueCpfValidator(isTaken);
    expect(validator(new FormControl('529.982.247-25'))).toEqual({ cpfTaken: true });
  });

  it('passes the id being edited so a client can keep its own CPF', () => {
    const validator = uniqueCpfValidator(isTaken, 'cli-1');
    validator(new FormControl('529.982.247-25'));
    expect(isTaken).toHaveBeenCalledWith('529.982.247-25', 'cli-1');
  });

  it('ignores empty values and free CPFs', () => {
    const validator = uniqueCpfValidator(isTaken);
    expect(validator(new FormControl(''))).toBeNull();
    expect(validator(new FormControl('153.509.460-56'))).toBeNull();
  });
});
