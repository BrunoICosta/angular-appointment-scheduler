import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { TranslocoPipe } from '@jsverse/transloco';

import { IconComponent } from '../icon/icon.component';

let nextId = 0;

/**
 * Accessible modal built on the native `<dialog>` element, which gives us focus trapping,
 * `Escape` handling and the top layer for free. The dialog opens as soon as it is rendered,
 * so parents control visibility with `@if` and always get a fresh instance (and fresh form).
 */
@Component({
  selector: 'app-modal',
  imports: [TranslocoPipe, IconComponent],
  template: `
    <dialog
      #dialog
      class="modal"
      [class.modal--wide]="wide()"
      [attr.aria-labelledby]="titleId"
      (cancel)="onCancel($event)"
    >
      <div class="modal__panel">
        <header class="modal__header">
          <h2 [id]="titleId">{{ heading() }}</h2>
          <button
            type="button"
            class="btn btn--ghost btn--icon btn--sm"
            [attr.aria-label]="'common.close' | transloco"
            (click)="closed.emit()"
          >
            <app-icon name="x" />
          </button>
        </header>
        <div class="modal__body">
          <ng-content />
        </div>
        <footer class="modal__footer">
          <ng-content select="[modalFooter]" />
        </footer>
      </div>
    </dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent {
  readonly heading = input.required<string>();
  readonly wide = input(false);
  readonly closed = output<void>();

  protected readonly titleId = `modal-title-${nextId++}`;
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  constructor() {
    const document = inject(DOCUMENT);
    const previouslyFocused = document.activeElement as HTMLElement | null;

    afterNextRender(() => {
      const element = this.dialog().nativeElement;
      // `showModal` is missing in some test DOMs; fall back to a non-modal open.
      if (typeof element.showModal === 'function') {
        element.showModal();
      } else {
        element.setAttribute('open', '');
      }
    });

    // Give focus back to whatever opened the dialog.
    inject(DestroyRef).onDestroy(() => previouslyFocused?.focus?.());
  }

  protected onCancel(event: Event): void {
    // Let the parent decide: it removes the modal, which closes the dialog.
    event.preventDefault();
    this.closed.emit();
  }
}
