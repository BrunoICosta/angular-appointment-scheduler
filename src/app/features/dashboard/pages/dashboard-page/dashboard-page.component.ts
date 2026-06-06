import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-dashboard-page',
  imports: [TranslocoPipe],
  template: `
    <section class="page">
      <header class="page-header">
        <div>
          <h1>{{ 'dashboard.title' | transloco }}</h1>
          <p>{{ 'dashboard.subtitle' | transloco }}</p>
        </div>
      </header>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent {}
