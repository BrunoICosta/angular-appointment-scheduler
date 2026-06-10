import { Routes } from '@angular/router';

export const PROFESSIONALS_ROUTES: Routes = [
  {
    path: '',
    title: 'nav.professionals',
    loadComponent: () =>
      import('./pages/professionals-page/professionals-page.component').then(
        (m) => m.ProfessionalsPageComponent,
      ),
  },
];
