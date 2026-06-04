import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import {
  EnvironmentProviders,
  inject,
  isDevMode,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';
import { provideTransloco } from '@jsverse/transloco';

import { LanguageService } from './language.service';
import { DEFAULT_LANGUAGE, LANGUAGES } from './languages';
import { TranslocoHttpLoader } from './transloco-loader';

/** Registers Transloco, locale data for formatting and preloads the initial language. */
export function provideI18n(): EnvironmentProviders {
  registerLocaleData(localePt, 'pt-BR');

  return makeEnvironmentProviders([
    provideTransloco({
      config: {
        availableLangs: LANGUAGES.map((language) => language.code),
        defaultLang: DEFAULT_LANGUAGE,
        fallbackLang: DEFAULT_LANGUAGE,
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
        missingHandler: { useFallbackTranslation: true },
      },
      loader: TranslocoHttpLoader,
    }),
    provideAppInitializer(() => inject(LanguageService).init()),
  ]);
}
