import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { LanguageService } from '../../../../core/i18n/language.service';
import { AppointmentsStore } from '../../../../core/stores/appointments.store';
import { ClientsStore } from '../../../../core/stores/clients.store';
import { ProfessionalsStore } from '../../../../core/stores/professionals.store';
import { ServicesStore } from '../../../../core/stores/services.store';
import { ProfessionalFilterComponent } from '../../components/professional-filter/professional-filter.component';
import { SchedulerCalendarComponent } from '../../components/scheduler-calendar/scheduler-calendar.component';
import { toBusinessHours, toCalendarEvents } from '../../data-access/calendar-events';

@Component({
  selector: 'app-calendar-page',
  imports: [TranslocoPipe, SchedulerCalendarComponent, ProfessionalFilterComponent],
  templateUrl: './calendar-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarPageComponent {
  private readonly router = inject(Router);
  private readonly appointments = inject(AppointmentsStore);
  private readonly professionalsStore = inject(ProfessionalsStore);
  private readonly clients = inject(ClientsStore);
  private readonly services = inject(ServicesStore);
  protected readonly language = inject(LanguageService).current;

  /** Bound from the `?professional=` query param (router component input binding). */
  readonly professional = input<string | undefined>();

  protected readonly professionals = this.professionalsStore.sorted;

  /** The selected professional, ignoring stale ids in the URL. */
  protected readonly selected = computed(() => this.professionalsStore.get(this.professional()));

  protected readonly events = computed(() => {
    const selectedId = this.selected()?.id;
    const appointments = this.appointments
      .all()
      .filter((appointment) => !selectedId || appointment.professionalId === selectedId);
    return toCalendarEvents(appointments, {
      professionals: this.professionalsStore.byId(),
      clients: this.clients.byId(),
      services: this.services.byId(),
    });
  });

  protected readonly businessHours = computed(() => {
    const selected = this.selected();
    return toBusinessHours(selected ? [selected] : this.professionalsStore.all());
  });

  protected selectProfessional(id: string | null): void {
    void this.router.navigate([], {
      queryParams: { professional: id },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
