import { registerAppLocales } from '../../../core/i18n/register-locales';
import { amountFromDigits, formatMoney, parseMoney } from './money';

/** `formatCurrency` uses a non-breaking space in pt-BR. */
const plain = (text: string) => text.replace(/\s/g, ' ');

describe('money mask', () => {
  beforeAll(() => registerAppLocales());

  describe('formatMoney', () => {
    it('formats BRL with Brazilian separators in pt-BR', () => {
      expect(plain(formatMoney(1234.56, 'pt-BR'))).toBe('R$ 1.234,56');
      expect(plain(formatMoney(0, 'pt-BR'))).toBe('R$ 0,00');
    });

    it('keeps BRL but uses US separators in en-US', () => {
      expect(formatMoney(1234.56, 'en-US')).toBe('R$1,234.56');
      expect(formatMoney(0.5, 'en-US')).toBe('R$0.50');
    });
  });

  describe('amountFromDigits (cents-first typing)', () => {
    it('fills the amount from the right', () => {
      expect(amountFromDigits('1')).toBe(0.01);
      expect(amountFromDigits('12')).toBe(0.12);
      expect(amountFromDigits('123')).toBe(1.23);
      expect(amountFromDigits('123456')).toBe(1234.56);
    });

    it('ignores the mask characters of the current value', () => {
      expect(amountFromDigits('R$ 1.234,567')).toBe(12345.67);
      expect(amountFromDigits('R$1,234.5')).toBe(123.45);
    });

    it('returns null when no digit is left (field cleared)', () => {
      expect(amountFromDigits('')).toBeNull();
      expect(amountFromDigits('R$ ')).toBeNull();
    });

    it('caps the number of digits', () => {
      expect(amountFromDigits('12345678901')).toBe(3456789.01);
    });
  });

  describe('parseMoney (paste)', () => {
    it('reads both decimal conventions', () => {
      expect(parseMoney('1.234,56')).toBe(1234.56);
      expect(parseMoney('1,234.56')).toBe(1234.56);
      expect(parseMoney('R$ 120,00')).toBe(120);
      expect(parseMoney('12,5')).toBe(12.5);
    });

    it('treats three trailing digits as a thousands group', () => {
      expect(parseMoney('1.234')).toBe(1234);
      expect(parseMoney('1,234')).toBe(1234);
    });

    it('reads whole numbers as reais, not cents', () => {
      expect(parseMoney('50')).toBe(50);
      expect(parseMoney('R$ 75')).toBe(75);
    });

    it('returns null for text without digits', () => {
      expect(parseMoney('abc')).toBeNull();
      expect(parseMoney('')).toBeNull();
    });
  });
});
