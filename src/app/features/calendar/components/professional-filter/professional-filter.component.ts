import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { Professional } from '../../../../core/models';

/** Chip group to show everyone's agenda or a single professional's. */
@Component({
  selector: 'app-professional-filter',
  imports: [TranslocoPipe],
  template: `
    <div class="chips" role="group" [attr.aria-label]="'calendar.filterLabel' | transloco">
      <button
        type="button"
        class="chip"
        [class.is-active]="!selectedId()"
        [attr.aria-pressed]="!selectedId()"
        (click)="selectedChange.emit(null)"
      >
        {{ 'calendar.allProfessionals' | transloco }}
      </button>
      @for (professional of professionals(); track professional.id) {
        <button
          type="button"
          class="chip"
          [style.--chip-color]="professional.color"
          [class.is-active]="selectedId() === professional.id"
          [attr.aria-pressed]="selectedId() === professional.id"
          (click)="selectedChange.emit(professional.id)"
        >
          <span class="dot" aria-hidden="true"></span>
          {{ professional.name }}
        </button>
      }
    </div>
  `,
  styles: `
    .chips {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding: 2px;
      scrollbar-width: thin;
    }

    .chip {
      --dot-color: var(--chip-color);
      display: inline-flex;
      flex: none;
      align-items: center;
      gap: 8px;
      min-height: 36px;
      padding: 0 14px;
      border: 1px solid var(--border-strong);
      border-radius: 999px;
      background: var(--surface);
      color: var(--text);
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition:
        background-color var(--transition),
        border-color var(--transition);

      &:hover {
        background: var(--surface-2);
      }

      &.is-active {
        border-color: var(--chip-color, var(--primary));
        background: color-mix(in srgb, var(--chip-color, var(--primary)) 14%, var(--surface));
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfessionalFilterComponent {
  readonly professionals = input.required<readonly Professional[]>();
  readonly selectedId = input<string | null>(null);
  readonly selectedChange = output<string | null>();
}
