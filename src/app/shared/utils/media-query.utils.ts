import { DOCUMENT } from '@angular/common';
import { DestroyRef, Signal, inject, signal } from '@angular/core';

/**
 * Signal that tracks a CSS media query. Must be called in an injection context;
 * the listener is removed automatically when that context is destroyed.
 */
export function mediaQuerySignal(query: string): Signal<boolean> {
  const view = inject(DOCUMENT).defaultView;
  const media = view?.matchMedia?.(query);
  const matches = signal(media?.matches ?? false);

  if (media) {
    const listener = (event: MediaQueryListEvent) => matches.set(event.matches);
    media.addEventListener('change', listener);
    inject(DestroyRef).onDestroy(() => media.removeEventListener('change', listener));
  }

  return matches.asReadonly();
}
