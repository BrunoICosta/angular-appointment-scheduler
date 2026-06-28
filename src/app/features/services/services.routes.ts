import { Routes } from '@angular/router';
import { provideTranslocoScope } from '@jsverse/transloco';

/** The feature's translations (public/i18n/services/*.json) load lazily with its chunk. */
export const SERVICES_ROUTES: Routes = [
  {
    path: '',
    providers: [provideTranslocoScope('services')],
    children: [
      {
        path: '',
        title: 'nav.services',
        loadComponent: () =>
          import('./pages/services-page/services-page.component').then(
            (m) => m.ServicesPageComponent,
          ),
      },
    ],
  },
];
