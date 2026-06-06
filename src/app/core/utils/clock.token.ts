import { InjectionToken } from '@angular/core';

/** Returns the current instant. Injected instead of calling `new Date()` so tests can freeze time. */
export type Clock = () => Date;

export const CLOCK = new InjectionToken<Clock>('CLOCK', {
  providedIn: 'root',
  factory: () => () => new Date(),
});
