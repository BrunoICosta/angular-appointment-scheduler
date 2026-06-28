import { Routes } from '@angular/router';
import { provideTranslocoScope } from '@jsverse/transloco';

/** The feature's translations (public/i18n/calendar/*.json) load lazily with its chunk. */
export const CALENDAR_ROUTES: Routes = [
  {
    path: '',
    providers: [provideTranslocoScope('calendar')],
    children: [
      {
        path: '',
        title: 'nav.calendar',
        loadComponent: () =>
          import('./pages/calendar-page/calendar-page.component').then(
            (m) => m.CalendarPageComponent,
          ),
      },
    ],
  },
];
