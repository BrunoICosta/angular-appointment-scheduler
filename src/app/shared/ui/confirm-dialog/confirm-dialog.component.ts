import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { ModalComponent } from '../modal/modal.component';
import { ConfirmService } from './confirm.service';

@Component({
  selector: 'app-confirm-dialog',
  imports: [ModalComponent, TranslocoPipe],
  template: `
    @if (confirm.pending(); as pending) {
      <app-modal
        [heading]="pending.title | transloco: pending.params"
        (closed)="confirm.answer(false)"
      >
        <p class="confirm__message">{{ pending.message | transloco: pending.params }}</p>
        <ng-container modalFooter>
          <button type="button" class="btn btn--secondary" (click)="confirm.answer(false)">
            {{ 'common.cancel' | transloco }}
          </button>
          <button
            type="button"
            class="btn"
            [class.btn--danger]="pending.danger"
            [class.btn--primary]="!pending.danger"
            (click)="confirm.answer(true)"
          >
            {{ pending.confirmLabel ?? 'common.confirm' | transloco }}
          </button>
        </ng-container>
      </app-modal>
    }
  `,
  styles: `
    .confirm__message {
      color: var(--text-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent {
  protected readonly confirm = inject(ConfirmService);
}
