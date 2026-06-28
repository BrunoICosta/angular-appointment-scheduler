import { Routes } from '@angular/router';
import { provideTranslocoScope } from '@jsverse/transloco';

/** The feature's translations (public/i18n/clients/*.json) load lazily with its chunk. */
export const CLIENTS_ROUTES: Routes = [
  {
    path: '',
    providers: [provideTranslocoScope('clients')],
    children: [
      {
        path: '',
        title: 'nav.clients',
        loadComponent: () =>
          import('./pages/clients-page/clients-page.component').then((m) => m.ClientsPageComponent),
      },
    ],
  },
];
