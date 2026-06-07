import { Injectable, signal } from '@angular/core';
import { TranslationParams } from '../../../core/i18n/translation-params';

export type ToastKind = 'success' | 'error' | 'info';

export interface Toast {
  readonly id: number;
  readonly kind: ToastKind;
  /** Translation key. */
  readonly message: string;
  readonly params?: TranslationParams;
}

const DEFAULT_DURATION_MS = 4500;

/** Transient notifications, announced to screen readers through a live region. */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 0;
  private readonly items = signal<readonly Toast[]>([]);
  readonly toasts = this.items.asReadonly();

  success(message: string, params?: TranslationParams): void {
    this.show('success', message, params);
  }

  error(message: string, params?: TranslationParams): void {
    this.show('error', message, params);
  }

  info(message: string, params?: TranslationParams): void {
    this.show('info', message, params);
  }

  dismiss(id: number): void {
    this.items.update((toasts) => toasts.filter((toast) => toast.id !== id));
  }

  private show(kind: ToastKind, message: string, params?: TranslationParams): void {
    const toast: Toast = { id: this.nextId++, kind, message, params };
    // Keep at most three toasts on screen.
    this.items.update((toasts) => [...toasts.slice(-2), toast]);
    setTimeout(() => this.dismiss(toast.id), DEFAULT_DURATION_MS);
  }
}
