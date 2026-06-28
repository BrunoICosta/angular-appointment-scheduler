import { Routes } from '@angular/router';
import { provideTranslocoScope } from '@jsverse/transloco';

/** The feature's translations (public/i18n/dashboard/*.json) load lazily with its chunk. */
export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    providers: [provideTranslocoScope('dashboard')],
    children: [
      {
        path: '',
        title: 'nav.dashboard',
        loadComponent: () =>
          import('./pages/dashboard-page/dashboard-page.component').then(
            (m) => m.DashboardPageComponent,
          ),
      },
    ],
  },
];
