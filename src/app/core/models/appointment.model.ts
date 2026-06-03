import { Entity } from './entity.model';

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled';

export const APPOINTMENT_STATUSES: readonly AppointmentStatus[] = [
  'scheduled',
  'completed',
  'cancelled',
];

export interface Appointment extends Entity {
  readonly professionalId: string;
  readonly clientId: string;
  readonly serviceId: string;
  /** ISO 8601 date-time strings. */
  readonly start: string;
  readonly end: string;
  readonly status: AppointmentStatus;
  readonly notes?: string;
}
