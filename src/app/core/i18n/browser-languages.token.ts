import { DOCUMENT } from '@angular/common';
import { InjectionToken, inject } from '@angular/core';

/** The browser's preferred languages, most preferred first. Overridable in tests. */
export const BROWSER_LANGUAGES = new InjectionToken<readonly string[]>('BROWSER_LANGUAGES', {
  providedIn: 'root',
  factory: () => {
    const navigator = inject(DOCUMENT).defaultView?.navigator;
    if (!navigator) {
      return [];
    }
    return navigator.languages?.length ? navigator.languages : [navigator.language];
  },
});
