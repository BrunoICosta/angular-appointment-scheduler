import { Injectable, InjectionToken, inject } from '@angular/core';

/** Prefix applied to every key so the app never collides with other data on the same origin. */
export const STORAGE_PREFIX = 'appointment-scheduler';

/** The `Storage` implementation used by the app. Overridable in tests. */
export const BROWSER_STORAGE = new InjectionToken<Storage | null>('BROWSER_STORAGE', {
  providedIn: 'root',
  factory: () => {
    try {
      return typeof localStorage === 'undefined' ? null : localStorage;
    } catch {
      // Access can throw when storage is disabled (privacy mode, sandboxed iframes...).
      return null;
    }
  },
});

/**
 * Thin JSON wrapper around `localStorage` that never throws: read failures fall back
 * to `null` and write failures are reported through the return value.
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly storage = inject(BROWSER_STORAGE);

  read<T>(key: string): T | null {
    try {
      const raw = this.storage?.getItem(this.prefixed(key));
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  write<T>(key: string, value: T): boolean {
    if (!this.storage) {
      return false;
    }
    try {
      this.storage.setItem(this.prefixed(key), JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  remove(key: string): void {
    try {
      this.storage?.removeItem(this.prefixed(key));
    } catch {
      // Nothing to clean up when storage is unavailable.
    }
  }

  private prefixed(key: string): string {
    return `${STORAGE_PREFIX}:${key}`;
  }
}
