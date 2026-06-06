import { formatDate } from '@angular/common';
import { Pipe, PipeTransform, inject } from '@angular/core';

import { LanguageService } from '../../core/i18n/language.service';

/**
 * `DatePipe` that follows the language chosen at runtime instead of the static `LOCALE_ID`.
 * Impure so it re-renders when the active locale signal changes.
 */
@Pipe({ name: 'localeDate', pure: false })
export class LocaleDatePipe implements PipeTransform {
  private readonly language = inject(LanguageService);

  transform(value: Date | string | number | null | undefined, format = 'mediumDate'): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }
    return formatDate(value, format, this.language.locale());
  }
}
