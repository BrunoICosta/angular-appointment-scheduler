import { ChangeDetectionStrategy, Component, OnInit, inject, input, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';

import { NewEntity, Service } from '../../../../core/models';
import { FieldErrorComponent } from '../../../../shared/forms/field-error/field-error.component';
import { MoneyInputDirective } from '../../../../shared/forms/masks/money-input.directive';
import { ModalComponent } from '../../../../shared/ui/modal/modal.component';

/** Durations offered in the select, in minutes (15 min steps up to 4h). */
export const DURATION_OPTIONS: readonly number[] = Array.from(
  { length: 16 },
  (_, i) => (i + 1) * 15,
);

@Component({
  selector: 'app-service-form-dialog',
  imports: [
    ReactiveFormsModule,
    TranslocoPipe,
    ModalComponent,
    FieldErrorComponent,
    MoneyInputDirective,
  ],
  templateUrl: './service-form-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceFormDialogComponent implements OnInit {
  readonly service = input<Service | null>(null);
  readonly save = output<NewEntity<Service>>();
  readonly closed = output<void>();

  protected readonly durations = DURATION_OPTIONS;

  protected readonly form = inject(NonNullableFormBuilder).group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(60)]],
    durationMinutes: [60, [Validators.required, Validators.min(15), Validators.max(240)]],
    // `number | null`: the money input reports `null` when the field is cleared.
    price: [0 as number | null, [Validators.required, Validators.min(0), Validators.max(100_000)]],
  });

  ngOnInit(): void {
    const service = this.service();
    if (service) {
      this.form.setValue({
        name: service.name,
        durationMinutes: service.durationMinutes,
        price: service.price,
      });
    }
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.save.emit({
      name: value.name.trim(),
      durationMinutes: Number(value.durationMinutes),
      price: Math.round((value.price ?? 0) * 100) / 100,
    });
  }
}
