import { Injectable, inject } from '@angular/core';
import { Observable, delay, of } from 'rxjs';

import { Appointment } from '../models';
import { AppointmentsStore } from '../stores/appointments.store';
import { TimeSlot, findConflicts } from './scheduling.rules';

/** Simulated network latency, so the UI exercises the async-validation "pending" state. */
export const AVAILABILITY_LATENCY_MS = 300;

/**
 * Availability lookup with the shape of a remote API call. Today it reads the local store;
 * swapping it for an HTTP request would not change any consumer.
 */
@Injectable({ providedIn: 'root' })
export class AvailabilityService {
  private readonly appointments = inject(AppointmentsStore);

  findConflicts(
    professionalId: string,
    slot: TimeSlot,
    excludeId?: string | null,
  ): Observable<Appointment[]> {
    const conflicts = findConflicts(this.appointments.all(), professionalId, slot, excludeId);
    return of(conflicts).pipe(delay(AVAILABILITY_LATENCY_MS));
  }
}
