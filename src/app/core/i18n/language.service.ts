import { DOCUMENT } from '@angular/common';
import { Injectable, computed, inject, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { Observable, map } from 'rxjs';

import { StorageService } from '../storage/storage.service';
import { BROWSER_LANGUAGES } from './browser-languages.token';
import { AppLanguage, LANGUAGES, LanguageOption, detectLanguage } from './languages';

const STORAGE_KEY = 'language';

/**
 * Single source of truth for the active language. Keeps Transloco, the `<html lang>`
 * attribute, the formatting locale and the persisted preference (localStorage) in sync.
 */
@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly transloco = inject(TranslocoService);
  private readonly storage = inject(StorageService);
  private readonly document = inject(DOCUMENT);
  private readonly browserLanguages = inject(BROWSER_LANGUAGES);

  private readonly active = signal<AppLanguage>(
    detectLanguage(this.storage.read<string>(STORAGE_KEY), this.browserLanguages),
  );

  readonly languages = LANGUAGES;
  readonly current = this.active.asReadonly();
  readonly option = computed<LanguageOption>(
    () => LANGUAGES.find((language) => language.code === this.active()) ?? LANGUAGES[0],
  );
  /** Locale id for Angular's `formatDate` / `formatCurrency`, e.g. `pt-BR` or `en-US`. */
  readonly locale = computed(() => this.option().locale);

  /** Loads the initial translation file. Used by an app initializer to avoid a flash of keys. */
  init(): Observable<void> {
    const language = this.active();
    this.apply(language);
    return this.transloco.load(language).pipe(map(() => undefined));
  }

  use(language: AppLanguage): void {
    if (language === this.active()) {
      return;
    }
    this.active.set(language);
    this.storage.write(STORAGE_KEY, language);
    this.apply(language);
  }

  private apply(language: AppLanguage): void {
    this.transloco.setActiveLang(language);
    this.document.documentElement.lang = language;
  }
}
