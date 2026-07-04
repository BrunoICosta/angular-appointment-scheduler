import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { FlagComponent } from '../../../shared/ui/flag/flag.component';
import { LanguageService } from '../../i18n/language.service';

/**
 * Flag toggle (Brazil = pt-BR, USA = en). Each button is named in its own language and marks
 * the active option with `aria-pressed`; the flags themselves are decorative.
 */
@Component({
  selector: 'app-language-switcher',
  imports: [TranslocoPipe, FlagComponent],
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
          <app-flag [language]="language.code" />
        </button>
      }
    </div>
  `,
  styles: `
    .switcher {
      display: inline-flex;
      gap: 2px;
      padding: 2px;
      border: 1px solid var(--border);
      border-radius: 12px;
      background: var(--surface-2);
    }

    .switcher__option {
      display: grid;
      place-items: center;
      width: 44px;
      height: 40px;
      padding: 0;
      border: 0;
      border-radius: 9px;
      background: transparent;
      cursor: pointer;
      transition:
        background-color var(--transition),
        box-shadow var(--transition);

      app-flag {
        opacity: 0.55;
        filter: grayscale(0.7);
        transition:
          opacity var(--transition),
          filter var(--transition),
          transform var(--transition);
      }

      &:hover app-flag,
      &:focus-visible app-flag {
        opacity: 1;
        filter: none;
      }

      &:hover app-flag {
        transform: scale(1.06);
      }

      /* Active state is shown by the ring and surface, not only by color. */
      &.is-active {
        background: var(--surface);
        box-shadow:
          0 0 0 2px var(--primary),
          var(--shadow-sm);

        app-flag {
          opacity: 1;
          filter: none;
        }
      }

      &:focus-visible {
        box-shadow: var(--focus-ring);
      }

      &.is-active:focus-visible {
        box-shadow:
          0 0 0 2px var(--primary),
          var(--focus-ring);
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageSwitcherComponent {
  protected readonly languages = inject(LanguageService);
}
