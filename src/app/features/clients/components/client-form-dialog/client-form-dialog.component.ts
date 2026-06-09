import { ChangeDetectionStrategy, Component, OnInit, inject, input, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';

import { Client, NewEntity } from '../../../../core/models';
import { ClientsStore } from '../../../../core/stores/clients.store';
import { FieldErrorComponent } from '../../../../shared/forms/field-error/field-error.component';
import { MaskDirective } from '../../../../shared/forms/masks/mask.directive';
import { cpfValidator } from '../../../../shared/forms/validators/cpf.validator';
import { phoneValidator } from '../../../../shared/forms/validators/phone.validator';
import { ModalComponent } from '../../../../shared/ui/modal/modal.component';
import { uniqueCpfValidator } from '../../data-access/unique-cpf.validator';

@Component({
  selector: 'app-client-form-dialog',
  imports: [ReactiveFormsModule, TranslocoPipe, ModalComponent, FieldErrorComponent, MaskDirective],
  templateUrl: './client-form-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientFormDialogComponent implements OnInit {
  /** Client being edited, or `null` to create a new one. */
  readonly client = input<Client | null>(null);
  readonly save = output<NewEntity<Client>>();
  readonly closed = output<void>();

  private readonly clients = inject(ClientsStore);

  protected readonly form = inject(NonNullableFormBuilder).group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
    phone: ['', [Validators.required, phoneValidator]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
    cpf: ['', [Validators.required, cpfValidator]],
    notes: ['', [Validators.maxLength(300)]],
  });

  ngOnInit(): void {
    const client = this.client();
    this.form.controls.cpf.addValidators(
      uniqueCpfValidator((cpf, exceptId) => this.clients.isCpfTaken(cpf, exceptId), client?.id),
    );
    if (client) {
      this.form.setValue({
        name: client.name,
        phone: client.phone,
        email: client.email,
        cpf: client.cpf,
        notes: client.notes ?? '',
      });
    }
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { notes, ...value } = this.form.getRawValue();
    const trimmedNotes = notes.trim();
    this.save.emit({
      ...value,
      name: value.name.trim(),
      email: value.email.trim().toLowerCase(),
      ...(trimmedNotes ? { notes: trimmedNotes } : {}),
    });
  }
}
