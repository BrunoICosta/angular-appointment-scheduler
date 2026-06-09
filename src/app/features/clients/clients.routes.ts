import { Routes } from '@angular/router';

export const CLIENTS_ROUTES: Routes = [
  {
    path: '',
    title: 'nav.clients',
    loadComponent: () =>
      import('./pages/clients-page/clients-page.component').then((m) => m.ClientsPageComponent),
  },
];
