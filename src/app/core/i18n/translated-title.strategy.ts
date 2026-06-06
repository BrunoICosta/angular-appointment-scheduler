import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { switchMap } from 'rxjs';

/**
 * Treats route `title` values as translation keys and keeps `document.title`
 * translated when the language changes at runtime.
 */
@Injectable({ providedIn: 'root' })
export class TranslatedTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly transloco = inject(TranslocoService);
  private currentKey: string | undefined;

  constructor() {
    super();
    // Wait for the translation file of the new language before re-rendering the title.
    this.transloco.langChanges$
      .pipe(switchMap((lang) => this.transloco.load(lang)))
      .subscribe(() => this.apply());
  }

  override updateTitle(snapshot: RouterStateSnapshot): void {
    this.currentKey = this.buildTitle(snapshot);
    this.apply();
  }

  private apply(): void {
    const appName = this.transloco.translate('app.name');
    const page = this.currentKey ? this.transloco.translate(this.currentKey) : '';
    this.title.setTitle(page && page !== this.currentKey ? `${page} · ${appName}` : appName);
  }
}
