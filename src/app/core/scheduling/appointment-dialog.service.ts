import { Injectable, computed, inject, signal } from '@angular/core';

import { Appointment } from '../models';
import { AppointmentsStore } from '../stores/appointments.store';

/** Optional values used to pre-fill the form, e.g. from a calendar slot selection. */
export interface AppointmentDraft {
  readonly professionalId?: string | null;
  readonly clientId?: string | null;
  readonly serviceId?: string | null;
  readonly start?: Date;
  readonly end?: Date;
}

export type AppointmentDialogState =
  | { readonly mode: 'create'; readonly draft: AppointmentDraft }
  | { readonly mode: 'edit'; readonly appointment: Appointment };

/**
 * Opens the appointment dialog from anywhere (calendar, dashboard...). The dialog itself
 * is rendered once by the root component inside a `@defer` block, so its code is only
 * downloaded the first time it is needed.
 */
@Injectable({ providedIn: 'root' })
export class AppointmentDialogService {
  private readonly appointments = inject(AppointmentsStore);
  private readonly current = signal<AppointmentDialogState | null>(null);

  readonly state = this.current.asReadonly();
  readonly isOpen = computed(() => this.current() !== null);

  openCreate(draft: AppointmentDraft = {}): void {
    this.current.set({ mode: 'create', draft });
  }

  openEdit(appointmentId: string): void {
    const appointment = this.appointments.get(appointmentId);
    if (appointment) {
      this.current.set({ mode: 'edit', appointment });
    }
  }

  close(): void {
    this.current.set(null);
  }
}
