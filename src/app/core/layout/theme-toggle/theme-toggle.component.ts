import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { ThemeService } from '../../theme/theme.service';

@Component({
  selector: 'app-theme-toggle',
  imports: [TranslocoPipe, IconComponent],
  template: `
    <button
      type="button"
      class="btn btn--ghost btn--icon"
      [attr.aria-label]="'shell.darkMode' | transloco"
      [attr.aria-pressed]="theme.isDark()"
      [title]="'shell.darkMode' | transloco"
      (click)="theme.toggle()"
    >
      <app-icon [name]="theme.isDark() ? 'sun' : 'moon'" />
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeToggleComponent {
  protected readonly theme = inject(ThemeService);
}
