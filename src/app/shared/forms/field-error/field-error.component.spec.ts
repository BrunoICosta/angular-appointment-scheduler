import { TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';

import { translocoTesting } from '../../../../testing/transloco-testing';
import { FieldErrorComponent } from './field-error.component';
import { describeErrors } from './validation-message';

describe('FieldErrorComponent', () => {
  function render(control: FormControl) {
    TestBed.configureTestingModule({ imports: [FieldErrorComponent, translocoTesting()] });
    const fixture = TestBed.createComponent(FieldErrorComponent);
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();
    return fixture;
  }

  it('stays silent until the control is touched', () => {
    const fixture = render(new FormControl('', Validators.required));
    expect(fixture.nativeElement.textContent.trim()).toBe('');
  });

  it('shows the translated message with interpolated params', async () => {
    const control = new FormControl('ab', Validators.minLength(3));
    const fixture = render(control);

    control.markAsTouched();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Use pelo menos 3 caracteres.');
  });

  it('clears the message once the value becomes valid', async () => {
    const control = new FormControl('', Validators.required);
    const fixture = render(control);
    control.markAsTouched();
    fixture.detectChanges();

    control.setValue('ok');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent.trim()).toBe('');
  });
});

describe('describeErrors', () => {
  it('maps the first error to a validation key with object payloads as params', () => {
    expect(describeErrors({ minlength: { requiredLength: 3 } })).toEqual({
      key: 'validation.minlength',
      params: { requiredLength: 3 },
    });
    expect(describeErrors({ required: true })).toEqual({ key: 'validation.required', params: {} });
    expect(describeErrors(null)).toBeNull();
  });
});
