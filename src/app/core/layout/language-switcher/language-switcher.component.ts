import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { LanguageService } from '../../i18n/language.service';

/** Segmented PT | EN control. Each option is labelled with its native language name. */
@Component({
  selector: 'app-language-switcher',
  imports: [TranslocoPipe],
  template: `
    <div class="switcher" role="group" [attr.aria-label]="'shell.language' | transloco">
      @for (language of languages.languages; track language.code) {
        <button
          type="button"
          class="switcher__option"
          [class.is-active]="language.code === languages.current()"
          [attr.aria-pressed]="language.code === languages.current()"
          [attr.aria-label]="language.label"
          [attr.lang]="language.code"
          [title]="language.label"
          (click)="languages.use(language.code)"
        >
          {{ language.short }}
        </button>
      }
    </div>
  `,
  styles: `
    .switcher {
      display: inline-flex;
      padding: 3px;
      gap: 2px;
      border-radius: 10px;
      background: var(--surface-2);
      border: 1px solid var(--border);
    }

    .switcher__option {
      min-width: 40px;
      min-height: 30px;
      padding: 0 10px;
      border: 0;
      border-radius: 7px;
      background: transparent;
      color: var(--text-muted);
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      transition:
        background-color var(--transition),
        color var(--transition);

      &:hover {
        color: var(--text);
      }

      &.is-active {
        background: var(--surface);
        color: var(--primary);
        box-shadow: var(--shadow-sm);
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageSwitcherComponent {
  protected readonly languages = inject(LanguageService);
}
