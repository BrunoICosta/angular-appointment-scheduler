import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { NewEntity, Professional } from '../../../../core/models';
import { AppointmentsStore } from '../../../../core/stores/appointments.store';
import { ProfessionalsStore } from '../../../../core/stores/professionals.store';
import { LocaleDatePipe } from '../../../../shared/pipes/locale-date.pipe';
import { ConfirmService } from '../../../../shared/ui/confirm-dialog/confirm.service';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { ToastService } from '../../../../shared/ui/toast/toast.service';
import { initials } from '../../../../shared/utils/text.utils';
import { WEEKDAYS_FROM_MONDAY, weekdayDate } from '../../../../shared/utils/weekday.utils';
import { ProfessionalFormDialogComponent } from '../../components/professional-form-dialog/professional-form-dialog.component';

type EditorState = Professional | null | undefined;

@Component({
  selector: 'app-professionals-page',
  imports: [
    RouterLink,
    TranslocoPipe,
    IconComponent,
    LocaleDatePipe,
    ProfessionalFormDialogComponent,
  ],
  templateUrl: './professionals-page.component.html',
  styleUrl: './professionals-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfessionalsPageComponent {
  private readonly professionalsStore = inject(ProfessionalsStore);
  private readonly appointments = inject(AppointmentsStore);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);

  protected readonly professionals = this.professionalsStore.sorted;
  protected readonly editing = signal<EditorState>(undefined);
  protected readonly weekdayOrder = WEEKDAYS_FROM_MONDAY;
  protected readonly weekdayDate = weekdayDate;
  protected readonly initials = initials;

  protected appointmentCount(professional: Professional): number {
    return this.appointments.countByProfessional(professional.id);
  }

  protected save(data: NewEntity<Professional>): void {
    const current = this.editing();
    if (current) {
      this.professionalsStore.update(current.id, data);
      this.toast.success('professionals.updated', { name: data.name });
    } else {
      this.professionalsStore.add(data);
      this.toast.success('professionals.created', { name: data.name });
    }
    this.editing.set(undefined);
  }

  protected async remove(professional: Professional): Promise<void> {
    const count = this.appointmentCount(professional);
    const confirmed = await this.confirm.confirm({
      title: 'professionals.deleteTitle',
      message: count > 0 ? 'professionals.deleteWithAppointments' : 'professionals.deleteMessage',
      confirmLabel: 'common.delete',
      params: { name: professional.name, count },
      danger: true,
    });
    if (!confirmed) {
      return;
    }
    this.appointments.removeWhere((appointment) => appointment.professionalId === professional.id);
    this.professionalsStore.remove(professional.id);
    this.toast.success('professionals.deleted', { name: professional.name });
  }
}
