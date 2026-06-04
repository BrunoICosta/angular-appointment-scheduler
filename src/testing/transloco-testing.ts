import { TranslocoTestingModule, TranslocoTestingOptions } from '@jsverse/transloco';

import en from '../../public/i18n/en.json';
import ptBR from '../../public/i18n/pt-BR.json';

/** Transloco wired with the real translation files, so specs can assert on rendered text. */
export function translocoTesting(options: TranslocoTestingOptions = {}) {
  return TranslocoTestingModule.forRoot({
    langs: { 'pt-BR': ptBR, en },
    translocoConfig: { availableLangs: ['pt-BR', 'en'], defaultLang: 'pt-BR' },
    preloadLangs: true,
    ...options,
  });
}
