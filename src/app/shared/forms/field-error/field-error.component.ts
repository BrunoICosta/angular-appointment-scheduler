import { ChangeDetectionStrategy, Component, effect, input, signal } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';

import { describeErrors, ValidationMessage } from './validation-message';

/**
 * Renders the first validation error of a control once the user has interacted with it.
 * Subscribes to `control.events` so it stays correct inside OnPush parents.
 * Give the host an `id` and reference it from the input's `aria-describedby`.
 */
@Component({
  selector: 'app-field-error',
  imports: [TranslocoPipe],
  template: `
    @if (message(); as error) {
      <p class="field__error">{{ error.key | transloco: error.params }}</p>
    }
  `,
  host: { 'aria-live': 'polite' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldErrorComponent {
  readonly control = input.required<AbstractControl>();

  protected readonly message = signal<ValidationMessage | null>(null);

  constructor() {
    effect((onCleanup) => {
      const control = this.control();
      const refresh = () =>
        this.message.set(
          control.invalid && (control.touched || control.dirty)
            ? describeErrors(control.errors)
            : null,
        );
      refresh();
      const subscription = control.events.subscribe(refresh);
      onCleanup(() => subscription.unsubscribe());
    });
  }
}
