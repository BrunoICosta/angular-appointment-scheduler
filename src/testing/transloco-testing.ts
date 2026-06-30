import { Translation, TranslocoTestingModule, TranslocoTestingOptions } from '@jsverse/transloco';

import { registerAppLocales } from '../app/core/i18n/register-locales';
import en from '../../public/i18n/en.json';
import ptBR from '../../public/i18n/pt-BR.json';
import appointmentsEn from '../../public/i18n/appointments/en.json';
import appointmentsPtBR from '../../public/i18n/appointments/pt-BR.json';
import calendarEn from '../../public/i18n/calendar/en.json';
import calendarPtBR from '../../public/i18n/calendar/pt-BR.json';
import clientsEn from '../../public/i18n/clients/en.json';
import clientsPtBR from '../../public/i18n/clients/pt-BR.json';
import dashboardEn from '../../public/i18n/dashboard/en.json';
import dashboardPtBR from '../../public/i18n/dashboard/pt-BR.json';
import professionalsEn from '../../public/i18n/professionals/en.json';
import professionalsPtBR from '../../public/i18n/professionals/pt-BR.json';
import servicesEn from '../../public/i18n/services/en.json';
import servicesPtBR from '../../public/i18n/services/pt-BR.json';

/** Global files plus every lazy feature scope, keyed the way the HTTP loader requests them. */
export const TEST_TRANSLATIONS: Record<string, Translation> = {
  'pt-BR': ptBR,
  en,
  'appointments/pt-BR': appointmentsPtBR,
  'appointments/en': appointmentsEn,
  'calendar/pt-BR': calendarPtBR,
  'calendar/en': calendarEn,
  'clients/pt-BR': clientsPtBR,
  'clients/en': clientsEn,
  'dashboard/pt-BR': dashboardPtBR,
  'dashboard/en': dashboardEn,
  'professionals/pt-BR': professionalsPtBR,
  'professionals/en': professionalsEn,
  'services/pt-BR': servicesPtBR,
  'services/en': servicesEn,
};

/**
 * Transloco wired with the real translation files (scopes preloaded), so specs can assert on
 * rendered text. Also registers the locale data the app registers at bootstrap.
 */
export function translocoTesting(options: TranslocoTestingOptions = {}) {
  registerAppLocales();
  return TranslocoTestingModule.forRoot({
    langs: TEST_TRANSLATIONS,
    translocoConfig: {
      availableLangs: ['pt-BR', 'en'],
      defaultLang: 'pt-BR',
      // Same as the app, so templates react to runtime language switches.
      reRenderOnLangChange: true,
    },
    preloadLangs: true,
    ...options,
  });
}
