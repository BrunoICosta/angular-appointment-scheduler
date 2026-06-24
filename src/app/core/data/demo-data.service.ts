import { Injectable, inject } from '@angular/core';

import { AppointmentsStore } from '../stores/appointments.store';
import { ClientsStore } from '../stores/clients.store';
import { ProfessionalsStore } from '../stores/professionals.store';
import { ServicesStore } from '../stores/services.store';

/** Restores every collection to the seed data (appointments regenerated around today). */
@Injectable({ providedIn: 'root' })
export class DemoDataService {
  private readonly stores = [
    inject(ProfessionalsStore),
    inject(ClientsStore),
    inject(ServicesStore),
    inject(AppointmentsStore),
  ];

  reset(): void {
    this.stores.forEach((store) => store.resetToSeed());
  }
}
