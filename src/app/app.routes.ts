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
    ],
  },
  { path: '**', redirectTo: '' },
];
