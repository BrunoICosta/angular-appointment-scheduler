import { Routes } from '@angular/router';

export const SERVICES_ROUTES: Routes = [
  {
    path: '',
    title: 'nav.services',
    loadComponent: () =>
      import('./pages/services-page/services-page.component').then((m) => m.ServicesPageComponent),
  },
];
