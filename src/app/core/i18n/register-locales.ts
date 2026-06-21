import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

/** Locale data used by `formatDate`/`formatCurrency`; `en-US` ships with Angular. */
export function registerAppLocales(): void {
  registerLocaleData(localePt, 'pt-BR');
}
