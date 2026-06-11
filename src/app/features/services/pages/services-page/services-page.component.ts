import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { NewEntity, Service } from '../../../../core/models';
import { AppointmentsStore } from '../../../../core/stores/appointments.store';
import { ServicesStore } from '../../../../core/stores/services.store';
import { LocaleCurrencyPipe } from '../../../../shared/pipes/locale-currency.pipe';
import { ConfirmService } from '../../../../shared/ui/confirm-dialog/confirm.service';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { ToastService } from '../../../../shared/ui/toast/toast.service';
import { ServiceFormDialogComponent } from '../../components/service-form-dialog/service-form-dialog.component';

type EditorState = Service | null | undefined;

@Component({
  selector: 'app-services-page',
  imports: [TranslocoPipe, IconComponent, LocaleCurrencyPipe, ServiceFormDialogComponent],
  templateUrl: './services-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicesPageComponent {
  private readonly servicesStore = inject(ServicesStore);
  private readonly appointments = inject(AppointmentsStore);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);

  protected readonly services = this.servicesStore.sorted;
  protected readonly editing = signal<EditorState>(undefined);

  protected appointmentCount(service: Service): number {
    return this.appointments.countByService(service.id);
  }

  protected save(data: NewEntity<Service>): void {
    const current = this.editing();
    if (current) {
      this.servicesStore.update(current.id, data);
      this.toast.success('services.updated', { name: data.name });
    } else {
      this.servicesStore.add(data);
      this.toast.success('services.created', { name: data.name });
    }
    this.editing.set(undefined);
  }

  protected async remove(service: Service): Promise<void> {
    const count = this.appointmentCount(service);
    if (count > 0) {
      // Removing a service would orphan existing appointments, so it is blocked instead.
      this.toast.error('services.inUse', { name: service.name, count });
      return;
    }
    const confirmed = await this.confirm.confirm({
      title: 'services.deleteTitle',
      message: 'services.deleteMessage',
      confirmLabel: 'common.delete',
      params: { name: service.name },
      danger: true,
    });
    if (confirmed) {
      this.servicesStore.remove(service.id);
      this.toast.success('services.deleted', { name: service.name });
    }
  }
}
