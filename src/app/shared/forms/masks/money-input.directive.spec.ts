import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { MemoryStorage } from '../../../../testing/memory-storage';
import { translocoTesting } from '../../../../testing/transloco-testing';
import { BROWSER_LANGUAGES } from '../../../core/i18n/browser-languages.token';
import { LanguageService } from '../../../core/i18n/language.service';
import { BROWSER_STORAGE } from '../../../core/storage/storage.service';
import { MoneyInputDirective } from './money-input.directive';

@Component({
  imports: [ReactiveFormsModule, MoneyInputDirective],
  template: `<input id="price" [formControl]="price" appMoneyInput />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class HostComponent {
  readonly price = new FormControl<number | null>(120, [Validators.required, Validators.max(1000)]);
}

/** `formatCurrency` uses a non-breaking space in pt-BR. */
const plain = (text: string) => text.replace(/\s/g, ' ');

describe('MoneyInputDirective', () => {
  function setup() {
    TestBed.configureTestingModule({
      imports: [HostComponent, translocoTesting()],
      providers: [
        { provide: BROWSER_STORAGE, useValue: new MemoryStorage() },
        { provide: BROWSER_LANGUAGES, useValue: ['pt-BR'] },
      ],
    });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const input = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>('#price');
    if (!input) {
      throw new Error('input not found');
    }
    const type = (value: string) => {
      input.value = value;
      input.dispatchEvent(new Event('input'));
    };
    return { fixture, host: fixture.componentInstance, input, type };
  }

  it('shows the initial number masked and sets mobile-friendly attributes', () => {
    const { input } = setup();
    expect(plain(input.value)).toBe('R$ 120,00');
    expect(input.getAttribute('inputmode')).toBe('decimal');
    expect(input.getAttribute('type')).toBe('text');
  });

  it('fills digits from the right and keeps a numeric control value', () => {
    const { host, input, type } = setup();
    type('');
    type('1');
    expect(plain(input.value)).toBe('R$ 0,01');
    type(input.value + '5');
    type(input.value + '0');
    expect(plain(input.value)).toBe('R$ 1,50');
    expect(host.price.value).toBe(1.5);
  });

  it('keeps the caret at the end while typing', () => {
    const { input, type } = setup();
    input.focus();
    type('R$ 120,009');
    expect(input.selectionStart).toBe(input.value.length);
    expect(input.selectionEnd).toBe(input.value.length);
  });

  it('parses pasted amounts in either convention', () => {
    const { host, input } = setup();
    const paste = (text: string) => {
      const data = new DataTransfer();
      data.setData('text', text);
      input.dispatchEvent(new ClipboardEvent('paste', { clipboardData: data, cancelable: true }));
    };
    paste('1.234,56');
    expect(host.price.value).toBe(1234.56);
    paste('R$ 89.90');
    expect(host.price.value).toBe(89.9);
    expect(plain(input.value)).toBe('R$ 89,90');
  });

  it('keeps validation working on the number', () => {
    const { host, type } = setup();
    type('');
    expect(host.price.value).toBeNull();
    expect(host.price.hasError('required')).toBeTrue();
    type('500000');
    expect(host.price.value).toBe(5000);
    expect(host.price.hasError('max')).toBeTrue();
  });

  it('re-masks with the new locale when the language changes', () => {
    const { fixture, input } = setup();
    TestBed.inject(LanguageService).use('en');
    fixture.detectChanges();
    TestBed.tick();
    expect(input.value).toBe('R$120.00');
  });
});
