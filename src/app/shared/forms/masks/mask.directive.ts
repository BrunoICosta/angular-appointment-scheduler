import { Directive, inject, input } from '@angular/core';
import { NgControl } from '@angular/forms';

import { MASKS, MASK_MAX_LENGTH, MaskKind } from './masks';

/**
 * Formats the value of a reactive-forms input while the user types, e.g.
 * `<input formControlName="cpf" appMask="cpf">`. The masked value is what reaches the model.
 */
@Directive({
  selector: 'input[appMask]',
  host: {
    inputmode: 'numeric',
    autocomplete: 'off',
    '[attr.maxlength]': 'maxLength()',
    '(input)': 'onInput($event)',
  },
})
export class MaskDirective {
  readonly appMask = input.required<MaskKind>();
  private readonly ngControl = inject(NgControl, { self: true, optional: true });

  protected maxLength(): number {
    return MASK_MAX_LENGTH[this.appMask()];
  }

  protected onInput(event: Event): void {
    const element = event.target as HTMLInputElement;
    const masked = MASKS[this.appMask()](element.value);
    if (masked === element.value) {
      return;
    }
    element.value = masked;
    this.ngControl?.control?.setValue(masked);
  }
}
