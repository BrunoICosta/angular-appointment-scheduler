import { TranslocoTestingModule, TranslocoTestingOptions } from '@jsverse/transloco';

import { registerAppLocales } from '../app/core/i18n/register-locales';
import en from '../../public/i18n/en.json';
import ptBR from '../../public/i18n/pt-BR.json';

/**
 * Transloco wired with the real translation files, so specs can assert on rendered text.
 * Also registers the locale data the app registers at bootstrap.
 */
export function translocoTesting(options: TranslocoTestingOptions = {}) {
  registerAppLocales();
  return TranslocoTestingModule.forRoot({
    langs: { 'pt-BR': ptBR, en },
    translocoConfig: { availableLangs: ['pt-BR', 'en'], defaultLang: 'pt-BR' },
    preloadLangs: true,
    ...options,
  });
}
