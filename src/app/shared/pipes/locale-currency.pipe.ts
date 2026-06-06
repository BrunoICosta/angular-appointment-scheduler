import { formatCurrency, getCurrencySymbol } from '@angular/common';
import { Pipe, PipeTransform, inject } from '@angular/core';

import { LanguageService } from '../../core/i18n/language.service';

/** Formats an amount (BRL by default) with the separators of the active locale. */
@Pipe({ name: 'localeCurrency', pure: false })
export class LocaleCurrencyPipe implements PipeTransform {
  private readonly language = inject(LanguageService);

  transform(value: number | null | undefined, currencyCode = 'BRL'): string {
    if (value === null || value === undefined || Number.isNaN(value)) {
      return '';
    }
    const locale = this.language.locale();
    return formatCurrency(
      value,
      locale,
      getCurrencySymbol(currencyCode, 'narrow', locale),
      currencyCode,
    );
  }
}
