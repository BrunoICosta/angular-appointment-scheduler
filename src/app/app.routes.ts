import { Routes } from '@angular/router';

import { ShellComponent } from './core/layout/shell/shell.component';

/**
 * Only the shell is part of the initial bundle: every feature is a lazy chunk loaded
 * through `loadChildren`, and each feature page is itself loaded with `loadComponent`.
 */
export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
      },
      {
        path: 'calendar',
        loadChildren: () =>
          import('./features/calendar/calendar.routes').then((m) => m.CALENDAR_ROUTES),
      },
      {
        path: 'clients',
        loadChildren: () =>
          import('./features/clients/clients.routes').then((m) => m.CLIENTS_ROUTES),
      },
      {
        path: 'professionals',
        loadChildren: () =>
          import('./features/professionals/professionals.routes').then(
            (m) => m.PROFESSIONALS_ROUTES,
          ),
      },
      {
        path: 'services',
        loadChildren: () =>
          import('./features/services/services.routes').then((m) => m.SERVICES_ROUTES),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
