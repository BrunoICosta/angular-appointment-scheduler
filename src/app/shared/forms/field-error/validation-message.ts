import { ValidationErrors } from '@angular/forms';
import { TranslationParams } from '../../../core/i18n/translation-params';

export interface ValidationMessage {
  /** Translation key under `validation.*`. */
  readonly key: string;
  readonly params: TranslationParams;
}

/**
 * Maps the first error of a `ValidationErrors` object to a translation key.
 * Error payloads that are objects (e.g. `{ requiredLength: 3 }`) become interpolation params.
 */
export function describeErrors(errors: ValidationErrors | null): ValidationMessage | null {
  if (!errors) {
    return null;
  }
  const [name] = Object.keys(errors);
  if (!name) {
    return null;
  }
  const payload: unknown = errors[name];
  const params =
    payload !== null && typeof payload === 'object' ? (payload as TranslationParams) : {};
  return { key: `validation.${name}`, params };
}
