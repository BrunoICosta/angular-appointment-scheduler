import { formatCurrency, getCurrencySymbol } from '@angular/common';

import { onlyDigits } from './masks';

/** Up to R$ 9.999.999,99: keeps amounts far below `Number.MAX_SAFE_INTEGER` cents. */
export const MONEY_MAX_DIGITS = 9;

/**
 * Formats an amount with the separators of `locale` and the BRL symbol:
 * `pt-BR` -> `R$ 1.234,56`, `en-US` -> `R$1,234.56`.
 */
export function formatMoney(value: number, locale: string, currencyCode = 'BRL'): string {
  return formatCurrency(
    value,
    locale,
    getCurrencySymbol(currencyCode, 'narrow', locale),
    currencyCode,
    '1.2-2',
  );
}

/**
 * Cents-first typing: every digit typed so far fills the amount from the right, so
 * `1`, `12`, `123` read as 0,01 / 0,12 / 1,23. Returns `null` when no digit is left.
 */
export function amountFromDigits(text: string): number | null {
  const digits = onlyDigits(text)
    .replace(/^0+(?=\d)/, '')
    .slice(-MONEY_MAX_DIGITS);
  return digits ? Number(digits) / 100 : null;
}

/**
 * Reads a pasted amount written in either convention (`1.234,56`, `1,234.56`, `R$ 50`,
 * `12,5`). The last `.` or `,` is the decimal separator when one or two digits follow it;
 * otherwise separators are treated as thousands groups.
 */
export function parseMoney(text: string): number | null {
  const cleaned = text.replace(/[^\d.,]/g, '');
  if (!/\d/.test(cleaned)) {
    return null;
  }
  const lastSeparator = Math.max(cleaned.lastIndexOf(','), cleaned.lastIndexOf('.'));
  const decimals = lastSeparator >= 0 ? cleaned.slice(lastSeparator + 1) : '';
  const hasDecimals = lastSeparator >= 0 && /^\d{1,2}$/.test(decimals);
  const integer = onlyDigits(hasDecimals ? cleaned.slice(0, lastSeparator) : cleaned);
  const amount = Number(`${integer || '0'}.${hasDecimals ? decimals : '0'}`);
  return Math.min(amount, (10 ** MONEY_MAX_DIGITS - 1) / 100);
}
