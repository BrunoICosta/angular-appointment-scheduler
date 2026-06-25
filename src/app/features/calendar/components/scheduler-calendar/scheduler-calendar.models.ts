/**
 * Public event payloads of `SchedulerCalendarComponent`. Kept in their own file so the page
 * can import them without an eager reference to the component, which must stay `@defer`red.
 */

export interface SlotSelection {
  readonly start: Date;
  readonly end: Date;
  /** True when picked in the month view, where only the day is known. */
  readonly allDay: boolean;
}

export interface AppointmentMove {
  readonly id: string;
  readonly start: Date;
  readonly end: Date;
  /** Puts the event back where it was; called when the move breaks a scheduling rule. */
  readonly revert: () => void;
}
