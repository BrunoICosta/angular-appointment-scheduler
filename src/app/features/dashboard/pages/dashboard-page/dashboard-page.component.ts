import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { CLOCK } from '../../../../core/utils/clock.token';
import { LocaleDatePipe } from '../../../../shared/pipes/locale-date.pipe';

@Component({
  selector: 'app-dashboard-page',
  imports: [TranslocoPipe, LocaleDatePipe],
  template: `
    <section class="page">
      <header class="page-header">
        <div>
          <h1>{{ 'dashboard.title' | transloco }}</h1>
          <p>{{ today | localeDate: 'fullDate' }}</p>
        </div>
      </header>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent {
  protected readonly today = inject(CLOCK)();
}
