import { DOCUMENT } from '@angular/common';
import { Directive, ElementRef, effect, forwardRef, inject, untracked } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { LanguageService } from '../../../core/i18n/language.service';
import { amountFromDigits, formatMoney, parseMoney } from './money';

/**
 * Currency input for reactive forms: shows the amount masked for the active locale
 * (`R$ 1.234,56` / `R$1,234.56`) while the form control keeps a plain `number`
 * (or `null` when empty), so `Validators.min/max/required` keep working.
 *
 * Digits fill from the right (cents first) and the caret stays at the end; pasted text is
 * parsed as a whole amount in either decimal convention.
 */
@Directive({
  selector: 'input[appMoneyInput]',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => MoneyInputDirective), multi: true },
  ],
  host: {
    type: 'text',
    inputmode: 'decimal',
    autocomplete: 'off',
    '(input)': 'onInput()',
    '(paste)': 'onPaste($event)',
    '(focus)': 'moveCaretToEnd()',
    '(blur)': 'onTouched()',
  },
})
export class MoneyInputDirective implements ControlValueAccessor {
  private readonly element = inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement;
  private readonly document = inject(DOCUMENT);
  private readonly language = inject(LanguageService);

  private value: number | null = null;
  private onChange: (value: number | null) => void = () => undefined;
  protected onTouched: () => void = () => undefined;

  constructor() {
    // Re-mask when the language changes while the form is open.
    effect(() => {
      this.language.locale();
      untracked(() => this.render());
    });
  }

  writeValue(value: unknown): void {
    this.value = typeof value === 'number' && Number.isFinite(value) ? value : null;
    this.render();
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.element.disabled = disabled;
  }

  protected onInput(): void {
    this.update(amountFromDigits(this.element.value));
  }

  protected onPaste(event: ClipboardEvent): void {
    const text = event.clipboardData?.getData('text');
    if (text === undefined) {
      return;
    }
    event.preventDefault();
    this.update(parseMoney(text));
  }

  protected moveCaretToEnd(): void {
    const end = this.element.value.length;
    this.element.setSelectionRange(end, end);
  }

  private update(value: number | null): void {
    this.value = value;
    this.render();
    this.onChange(value);
  }

  private render(): void {
    this.element.value = this.value === null ? '' : formatMoney(this.value, this.language.locale());
    // Cents-first typing always edits the end of the number, so keep the caret there.
    if (this.document.activeElement === this.element) {
      this.moveCaretToEnd();
    }
  }
}
