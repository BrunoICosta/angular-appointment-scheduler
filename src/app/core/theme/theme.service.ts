import { DOCUMENT } from '@angular/common';
import { Injectable, computed, effect, inject, signal } from '@angular/core';

import { StorageService } from '../storage/storage.service';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

/** Light/dark theme with the OS preference as default and the user's choice persisted. */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly storage = inject(StorageService);

  private readonly active = signal<Theme>(this.resolveInitialTheme());

  readonly theme = this.active.asReadonly();
  readonly isDark = computed(() => this.active() === 'dark');

  constructor() {
    effect(() => {
      this.document.documentElement.dataset['theme'] = this.active();
    });
  }

  toggle(): void {
    this.set(this.isDark() ? 'light' : 'dark');
  }

  set(theme: Theme): void {
    this.active.set(theme);
    this.storage.write(STORAGE_KEY, theme);
  }

  private resolveInitialTheme(): Theme {
    const stored = this.storage.read<Theme>(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    const prefersDark = this.document.defaultView?.matchMedia?.('(prefers-color-scheme: dark)');
    return prefersDark?.matches ? 'dark' : 'light';
  }
}
