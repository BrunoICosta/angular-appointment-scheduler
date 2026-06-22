import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { IconName } from '../../../../shared/ui/icon/icons';

@Component({
  selector: 'app-stat-card',
  imports: [IconComponent],
  template: `
    <span class="stat__icon" aria-hidden="true"><app-icon [name]="icon()" /></span>
    <div>
      <p class="stat__label">{{ label() }}</p>
      <p class="stat__value">{{ value() }}</p>
      @if (hint()) {
        <p class="stat__hint">{{ hint() }}</p>
      }
    </div>
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 16px;
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      background: var(--surface);
      box-shadow: var(--shadow-sm);
    }

    .stat__icon {
      display: grid;
      place-items: center;
      flex: none;
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: color-mix(in srgb, var(--stat-accent, var(--primary)) 14%, transparent);
      color: var(--stat-accent, var(--primary));
    }

    .stat__label {
      color: var(--text-muted);
      font-size: 0.8rem;
      font-weight: 600;
    }

    .stat__value {
      font-size: 1.45rem;
      font-weight: 800;
      line-height: 1.2;
      font-variant-numeric: tabular-nums;
    }

    @media (max-width: 479px) {
      :host {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
        padding: 14px;
      }

      .stat__icon {
        width: 36px;
        height: 36px;
      }

      .stat__value {
        font-size: 1.2rem;
      }
    }

    .stat__hint {
      color: var(--text-subtle);
      font-size: 0.75rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatCardComponent {
  readonly icon = input.required<IconName>();
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly hint = input<string>();
}
