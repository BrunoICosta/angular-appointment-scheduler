import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { IconComponent } from '../icon/icon.component';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast-container',
  imports: [TranslocoPipe, IconComponent],
  template: `
    <div class="toasts" role="status" aria-live="polite" aria-atomic="false">
      @for (toast of toasts.toasts(); track toast.id) {
        <div [class]="'toast toast--' + toast.kind">
          <app-icon
            [name]="toast.kind === 'error' ? 'alert' : toast.kind === 'success' ? 'check' : 'info'"
          />
          <span class="toast__message">{{ toast.message | transloco: toast.params }}</span>
          <button
            type="button"
            class="btn btn--ghost btn--icon btn--sm"
            [attr.aria-label]="'common.close' | transloco"
            (click)="toasts.dismiss(toast.id)"
          >
            <app-icon name="x" />
          </button>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastContainerComponent {
  protected readonly toasts = inject(ToastService);
}
