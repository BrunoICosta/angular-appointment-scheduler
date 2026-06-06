import { Injectable, computed, inject } from '@angular/core';

import { buildSeedAppointments } from '../data/seed';
import { Appointment } from '../models';
import { CLOCK } from '../utils/clock.token';
import { EntityStore } from './entity.store';

@Injectable({ providedIn: 'root' })
export class AppointmentsStore extends EntityStore<Appointment> {
  /** Appointments ordered by start time. */
  readonly chronological = computed(() =>
    [...this.all()].sort((a, b) => a.start.localeCompare(b.start)),
  );

  constructor() {
    const clock = inject(CLOCK);
    super('appointments', () => buildSeedAppointments(clock()));
  }

  forProfessional(professionalId: string): Appointment[] {
    return this.all().filter((appointment) => appointment.professionalId === professionalId);
  }

  countByClient(clientId: string): number {
    return this.all().filter((appointment) => appointment.clientId === clientId).length;
  }

  countByProfessional(professionalId: string): number {
    return this.all().filter((appointment) => appointment.professionalId === professionalId).length;
  }

  countByService(serviceId: string): number {
    return this.all().filter((appointment) => appointment.serviceId === serviceId).length;
  }
}
