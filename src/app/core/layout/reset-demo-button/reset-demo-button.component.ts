import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { ConfirmService } from '../../../shared/ui/confirm-dialog/confirm.service';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { DemoDataService } from '../../data/demo-data.service';

@Component({
  selector: 'app-reset-demo-button',
  imports: [TranslocoPipe, IconComponent],
  template: `
    <button
      type="button"
      class="btn btn--ghost btn--icon"
      [attr.aria-label]="'shell.resetDemo' | transloco"
      [title]="'shell.resetDemo' | transloco"
      (click)="reset()"
    >
      <app-icon name="reset" />
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetDemoButtonComponent {
  private readonly demoData = inject(DemoDataService);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);

  protected async reset(): Promise<void> {
    const confirmed = await this.confirm.confirm({
      title: 'shell.resetDemo',
      message: 'shell.resetDemoMessage',
      confirmLabel: 'shell.resetDemoConfirm',
      danger: true,
    });
    if (confirmed) {
      this.demoData.reset();
      this.toast.success('shell.resetDemoDone');
    }
  }
}
