import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { interval, map } from 'rxjs';

import { Appointment } from '../../../../core/models';
import { AppointmentDialogService } from '../../../../core/scheduling/appointment-dialog.service';
import { AppointmentsStore } from '../../../../core/stores/appointments.store';
import { ClientsStore } from '../../../../core/stores/clients.store';
import { ProfessionalsStore } from '../../../../core/stores/professionals.store';
import { ServicesStore } from '../../../../core/stores/services.store';
import { CLOCK } from '../../../../core/utils/clock.token';
import { LocaleCurrencyPipe } from '../../../../shared/pipes/locale-currency.pipe';
import { LocaleDatePipe } from '../../../../shared/pipes/locale-date.pipe';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { addDays, isSameDay, startOfDay } from '../../../../shared/utils/date-time.utils';
import { StatCardComponent } from '../../components/stat-card/stat-card.component';
import {
  expectedRevenue,
  groupByDay,
  isWithin,
  upcomingAppointments,
  weekRange,
} from '../../data-access/dashboard.selectors';

const UPCOMING_LIMIT = 8;
const REFRESH_INTERVAL_MS = 60_000;

/** View model of one row in the "upcoming appointments" list. */
interface UpcomingItem {
  readonly appointment: Appointment;
  readonly start: string;
  readonly clientName: string;
  readonly serviceName: string;
  readonly professionalName: string;
  readonly color: string;
  readonly price: number;
}

@Component({
  selector: 'app-dashboard-page',
  imports: [
    RouterLink,
    TranslocoPipe,
    LocaleDatePipe,
    LocaleCurrencyPipe,
    IconComponent,
    StatCardComponent,
  ],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent {
  private readonly appointments = inject(AppointmentsStore);
  private readonly professionals = inject(ProfessionalsStore);
  private readonly clients = inject(ClientsStore);
  private readonly services = inject(ServicesStore);
  private readonly dialog = inject(AppointmentDialogService);
  private readonly clock = inject(CLOCK);

  /** Ticks every minute so "upcoming" drops appointments that have just ended. */
  protected readonly now = toSignal(interval(REFRESH_INTERVAL_MS).pipe(map(() => this.clock())), {
    initialValue: this.clock(),
  });

  protected readonly todayCount = computed(() => {
    const now = this.now();
    return this.appointments
      .all()
      .filter((a) => a.status !== 'cancelled' && isSameDay(new Date(a.start), now)).length;
  });

  private readonly thisWeek = computed(() => {
    const { start, end } = weekRange(this.now());
    return this.appointments.all().filter((appointment) => isWithin(appointment, start, end));
  });

  protected readonly weekCount = computed(
    () => this.thisWeek().filter((appointment) => appointment.status !== 'cancelled').length,
  );
  protected readonly weekRevenue = computed(() =>
    expectedRevenue(this.thisWeek(), this.services.byId()),
  );
  protected readonly clientCount = this.clients.count;

  protected readonly upcomingGroups = computed(() => {
    const items = upcomingAppointments(this.appointments.all(), this.now(), UPCOMING_LIMIT).map(
      (appointment) => this.toItem(appointment),
    );
    return groupByDay(items);
  });

  /** Today's workload per professional, for the side panel. */
  protected readonly todayByProfessional = computed(() => {
    const now = this.now();
    const today = this.appointments
      .all()
      .filter((a) => a.status !== 'cancelled' && isSameDay(new Date(a.start), now));
    return this.professionals.sorted().map((professional) => ({
      professional,
      count: today.filter((a) => a.professionalId === professional.id).length,
      working: professional.workingHours[now.getDay()] !== null,
    }));
  });

  protected dayLabel(date: Date): 'today' | 'tomorrow' | null {
    const today = startOfDay(this.now());
    if (isSameDay(date, today)) {
      return 'today';
    }
    return isSameDay(date, addDays(today, 1)) ? 'tomorrow' : null;
  }

  protected newAppointment(): void {
    this.dialog.openCreate();
  }

  protected open(appointment: Appointment): void {
    this.dialog.openEdit(appointment.id);
  }

  private toItem(appointment: Appointment): UpcomingItem {
    const professional = this.professionals.get(appointment.professionalId);
    const service = this.services.get(appointment.serviceId);
    return {
      appointment,
      start: appointment.start,
      clientName: this.clients.get(appointment.clientId)?.name ?? '—',
      serviceName: service?.name ?? '—',
      professionalName: professional?.name ?? '—',
      color: professional?.color ?? 'var(--text-subtle)',
      price: service?.price ?? 0,
    };
  }
}
