export type AppLanguage = 'pt-BR' | 'en';

export interface LanguageOption {
  readonly code: AppLanguage;
  /** Angular locale id used for dates, numbers and currency. */
  readonly locale: string;
  /** Native name, used as the switcher button name regardless of the active language. */
  readonly label: string;
}

export const LANGUAGES: readonly LanguageOption[] = [
  { code: 'pt-BR', locale: 'pt-BR', label: 'Português (Brasil)' },
  { code: 'en', locale: 'en-US', label: 'English' },
];

export const DEFAULT_LANGUAGE: AppLanguage = 'pt-BR';

export function isAppLanguage(value: unknown): value is AppLanguage {
  return LANGUAGES.some((language) => language.code === value);
}

/**
 * Picks the initial language: saved choice > first browser language (`pt*` -> pt-BR,
 * anything else -> en) > pt-BR when the browser reports nothing.
 */
export function detectLanguage(saved: unknown, browserLanguages: readonly string[]): AppLanguage {
  if (isAppLanguage(saved)) {
    return saved;
  }
  const [preferred] = browserLanguages.filter(Boolean);
  if (!preferred) {
    return DEFAULT_LANGUAGE;
  }
  return preferred.toLowerCase().startsWith('pt') ? 'pt-BR' : 'en';
}
