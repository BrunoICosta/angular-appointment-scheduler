import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { AppLanguage } from '../../../core/i18n/languages';

/**
 * Decorative 28x20 flag for a language (Brazil for pt-BR, USA for en). Inline SVG instead of
 * flag emoji, which Windows renders as plain letters. The rounded corners come from the host
 * (`overflow: hidden`), so no `clipPath` id has to be unique per instance.
 */
@Component({
  selector: 'app-flag',
  template: `
    <svg viewBox="0 0 28 20" width="28" height="20" aria-hidden="true" focusable="false">
      @switch (language()) {
        @case ('pt-BR') {
          <rect width="28" height="20" fill="#009C3B" />
          <path d="M14 2.5 25.5 10 14 17.5 2.5 10Z" fill="#FFDF00" />
          <circle cx="14" cy="10" r="4.6" fill="#002776" />
          <path d="M9.6 8.9c3-.9 6.3-.6 8.9 1.1l-.3.9c-2.5-1.6-5.6-1.9-8.4-1.1Z" fill="#fff" />
        }
        @case ('en') {
          <rect width="28" height="20" fill="#fff" />
          <path
            d="M0 0h28M0 3.08h28M0 6.15h28M0 9.23h28M0 12.3h28M0 15.38h28M0 18.46h28"
            stroke="#B22234"
            stroke-width="1.54"
            transform="translate(0 .77)"
          />
          <rect width="12" height="10.77" fill="#3C3B6E" />
          <g fill="#fff">
            @for (star of stars; track $index) {
              <circle [attr.cx]="star[0]" [attr.cy]="star[1]" r=".6" />
            }
          </g>
        }
      }
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      flex: none;
      width: 28px;
      height: 20px;
      overflow: hidden;
      border-radius: 3px;
      /* Hairline so the white stripes stay visible on light surfaces. */
      box-shadow: inset 0 0 0 1px rgb(0 0 0 / 12%);
    }

    svg {
      display: block;
      width: 100%;
      height: 100%;
    }
  `,
  host: { 'aria-hidden': 'true' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlagComponent {
  readonly language = input.required<AppLanguage>();

  /** Simplified canton: 4 rows alternating 4 and 3 stars. */
  protected readonly stars: readonly (readonly [number, number])[] = [
    [2, 2],
    [5, 2],
    [8, 2],
    [11, 2],
    [3.5, 4],
    [6.5, 4],
    [9.5, 4],
    [2, 6],
    [5, 6],
    [8, 6],
    [11, 6],
    [3.5, 8],
    [6.5, 8],
    [9.5, 8],
  ];
}
