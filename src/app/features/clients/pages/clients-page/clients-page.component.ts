import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { Client, NewEntity } from '../../../../core/models';
import { AppointmentsStore } from '../../../../core/stores/appointments.store';
import { ClientsStore } from '../../../../core/stores/clients.store';
import { ConfirmService } from '../../../../shared/ui/confirm-dialog/confirm.service';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { ToastService } from '../../../../shared/ui/toast/toast.service';
import { initials, normalizeForSearch } from '../../../../shared/utils/text.utils';
import { ClientFormDialogComponent } from '../../components/client-form-dialog/client-form-dialog.component';

/** `undefined` = dialog closed, `null` = creating, `Client` = editing. */
type EditorState = Client | null | undefined;

@Component({
  selector: 'app-clients-page',
  imports: [TranslocoPipe, IconComponent, ClientFormDialogComponent],
  templateUrl: './clients-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientsPageComponent {
  private readonly clients = inject(ClientsStore);
  private readonly appointments = inject(AppointmentsStore);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);

  protected readonly query = signal('');
  protected readonly editing = signal<EditorState>(undefined);
  protected readonly initials = initials;

  protected readonly total = this.clients.count;
  protected readonly filtered = computed(() => {
    const query = normalizeForSearch(this.query());
    const digits = query.replace(/\D/g, '');
    return this.clients.sorted().filter((client) => {
      if (!query) {
        return true;
      }
      const matchesText = normalizeForSearch(`${client.name} ${client.email}`).includes(query);
      const matchesDigits =
        digits.length > 0 && `${client.phone}${client.cpf}`.replace(/\D/g, '').includes(digits);
      return matchesText || matchesDigits;
    });
  });

  protected appointmentCount(client: Client): number {
    return this.appointments.countByClient(client.id);
  }

  protected onSearch(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  protected save(data: NewEntity<Client>): void {
    const current = this.editing();
    if (current) {
      this.clients.update(current.id, data);
      this.toast.success('clients.updated', { name: data.name });
    } else {
      this.clients.add(data);
      this.toast.success('clients.created', { name: data.name });
    }
    this.editing.set(undefined);
  }

  protected async remove(client: Client): Promise<void> {
    const appointments = this.appointmentCount(client);
    const confirmed = await this.confirm.confirm({
      title: 'clients.deleteTitle',
      message: appointments > 0 ? 'clients.deleteWithAppointments' : 'clients.deleteMessage',
      confirmLabel: 'common.delete',
      params: { name: client.name, count: appointments },
      danger: true,
    });
    if (!confirmed) {
      return;
    }
    this.appointments.removeWhere((appointment) => appointment.clientId === client.id);
    this.clients.remove(client.id);
    this.toast.success('clients.deleted', { name: client.name });
  }
}
