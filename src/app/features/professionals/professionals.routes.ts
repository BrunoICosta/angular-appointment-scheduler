import { Routes } from '@angular/router';
import { provideTranslocoScope } from '@jsverse/transloco';

/** The feature's translations (public/i18n/professionals/*.json) load lazily with its chunk. */
export const PROFESSIONALS_ROUTES: Routes = [
  {
    path: '',
    providers: [provideTranslocoScope('professionals')],
    children: [
      {
        path: '',
        title: 'nav.professionals',
        loadComponent: () =>
          import('./pages/professionals-page/professionals-page.component').then(
            (m) => m.ProfessionalsPageComponent,
          ),
      },
    ],
  },
];
