import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { MaskDirective } from './mask.directive';

@Component({
  imports: [ReactiveFormsModule, MaskDirective],
  template: `
    <input id="phone" [formControl]="phone" appMask="phone" />
    <input id="cpf" [formControl]="cpf" appMask="cpf" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class HostComponent {
  readonly phone = new FormControl('');
  readonly cpf = new FormControl('');
}

describe('MaskDirective', () => {
  function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const typeInto = (id: string, value: string) => {
      const input = element.querySelector<HTMLInputElement>(`#${id}`);
      if (!input) {
        throw new Error(`#${id} not found`);
      }
      input.value = value;
      input.dispatchEvent(new Event('input'));
      return input;
    };
    return { host: fixture.componentInstance, typeInto };
  }

  it('masks the phone in the view and in the model', () => {
    const { host, typeInto } = setup();
    const input = typeInto('phone', '11987654321');
    expect(input.value).toBe('(11) 98765-4321');
    expect(host.phone.value).toBe('(11) 98765-4321');
  });

  it('masks the CPF and limits the length', () => {
    const { host, typeInto } = setup();
    const input = typeInto('cpf', '529982247251234');
    expect(input.value).toBe('529.982.247-25');
    expect(host.cpf.value).toBe('529.982.247-25');
    expect(input.getAttribute('maxlength')).toBe('14');
    expect(input.getAttribute('inputmode')).toBe('numeric');
  });
});
