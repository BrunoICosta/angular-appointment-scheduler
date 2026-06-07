import { Injectable, signal } from '@angular/core';
import { TranslationParams } from '../../../core/i18n/translation-params';

export interface ConfirmOptions {
  /** Translation keys. */
  readonly title: string;
  readonly message: string;
  readonly confirmLabel?: string;
  readonly params?: TranslationParams;
  readonly danger?: boolean;
}

interface PendingConfirmation extends ConfirmOptions {
  readonly resolve: (confirmed: boolean) => void;
}

/** Promise-based replacement for `window.confirm`, rendered by `ConfirmDialogComponent`. */
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private readonly pendingState = signal<PendingConfirmation | null>(null);
  readonly pending = this.pendingState.asReadonly();

  confirm(options: ConfirmOptions): Promise<boolean> {
    // A new request supersedes an unanswered one.
    this.pendingState()?.resolve(false);
    return new Promise<boolean>((resolve) => this.pendingState.set({ ...options, resolve }));
  }

  answer(confirmed: boolean): void {
    const pending = this.pendingState();
    this.pendingState.set(null);
    pending?.resolve(confirmed);
  }
}
