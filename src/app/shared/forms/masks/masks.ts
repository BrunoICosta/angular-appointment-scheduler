/** Input masks applied while typing. Each function is pure and idempotent. */

export type MaskKind = 'cpf' | 'phone';

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

/** Progressive CPF mask: `12345678909` -> `123.456.789-09`. Extra digits are dropped. */
export function formatCpf(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);
  const parts = [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 9)].filter(Boolean);
  const checkDigits = digits.slice(9, 11);
  return parts.join('.') + (checkDigits ? `-${checkDigits}` : '');
}

/**
 * Progressive Brazilian phone mask. Up to 10 digits it uses the landline layout
 * `(11) 3456-7890`; the 11th digit switches to the mobile layout `(11) 98765-4321`.
 */
export function formatPhone(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length === 0) {
    return '';
  }
  const areaCode = digits.slice(0, 2);
  const number = digits.slice(2);
  if (digits.length <= 2) {
    return `(${areaCode}`;
  }
  const splitAt = digits.length === 11 ? 5 : 4;
  const head = number.slice(0, splitAt);
  const tail = number.slice(splitAt);
  return `(${areaCode}) ${head}${tail ? `-${tail}` : ''}`;
}

export const MASKS: Readonly<Record<MaskKind, (value: string) => string>> = {
  cpf: formatCpf,
  phone: formatPhone,
};

/** Max length of the masked value, used for the input's `maxlength`. */
export const MASK_MAX_LENGTH: Readonly<Record<MaskKind, number>> = {
  cpf: 14,
  phone: 15,
};
