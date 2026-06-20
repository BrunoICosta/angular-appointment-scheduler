import { formatCpf, formatPhone, onlyDigits } from './masks';

describe('masks', () => {
  it('onlyDigits strips everything but numbers', () => {
    expect(onlyDigits('(11) 98765-4321')).toBe('11987654321');
    expect(onlyDigits('abc')).toBe('');
  });

  describe('formatCpf', () => {
    it('formats progressively while typing', () => {
      expect(formatCpf('')).toBe('');
      expect(formatCpf('529')).toBe('529');
      expect(formatCpf('5299')).toBe('529.9');
      expect(formatCpf('5299822')).toBe('529.982.2');
      expect(formatCpf('5299822472')).toBe('529.982.247-2');
      expect(formatCpf('52998224725')).toBe('529.982.247-25');
    });

    it('drops extra digits and is idempotent', () => {
      expect(formatCpf('529982247259999')).toBe('529.982.247-25');
      expect(formatCpf('529.982.247-25')).toBe('529.982.247-25');
    });
  });

  describe('formatPhone', () => {
    it('formats the area code first', () => {
      expect(formatPhone('')).toBe('');
      expect(formatPhone('1')).toBe('(1');
      expect(formatPhone('11')).toBe('(11');
      expect(formatPhone('113')).toBe('(11) 3');
    });

    it('uses the landline layout up to 10 digits', () => {
      expect(formatPhone('1134567')).toBe('(11) 3456-7');
      expect(formatPhone('1134567890')).toBe('(11) 3456-7890');
    });

    it('switches to the mobile layout on the 11th digit', () => {
      expect(formatPhone('11987654321')).toBe('(11) 98765-4321');
    });

    it('is idempotent and ignores extra digits', () => {
      expect(formatPhone('(11) 98765-4321')).toBe('(11) 98765-4321');
      expect(formatPhone('1198765432199')).toBe('(11) 98765-4321');
    });
  });
});
