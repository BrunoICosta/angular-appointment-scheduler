import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { LanguageService } from '../../../../core/i18n/language.service';
import { AppointmentsStore } from '../../../../core/stores/appointments.store';
import { ClientsStore } from '../../../../core/stores/clients.store';
import { ProfessionalsStore } from '../../../../core/stores/professionals.store';
import { ServicesStore } from '../../../../core/stores/services.store';
import { SchedulerCalendarComponent } from '../../components/scheduler-calendar/scheduler-calendar.component';
import { toBusinessHours, toCalendarEvents } from '../../data-access/calendar-events';

@Component({
  selector: 'app-calendar-page',
  imports: [TranslocoPipe, SchedulerCalendarComponent],
  templateUrl: './calendar-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarPageComponent {
  private readonly appointments = inject(AppointmentsStore);
  private readonly professionals = inject(ProfessionalsStore);
  private readonly clients = inject(ClientsStore);
  private readonly services = inject(ServicesStore);
  protected readonly language = inject(LanguageService).current;

  protected readonly events = computed(() =>
    toCalendarEvents(this.appointments.all(), {
      professionals: this.professionals.byId(),
      clients: this.clients.byId(),
      services: this.services.byId(),
    }),
  );

  protected readonly businessHours = computed(() => toBusinessHours(this.professionals.all()));
}
