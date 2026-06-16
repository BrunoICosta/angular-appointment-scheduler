import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { AppointmentDialogService } from './core/scheduling/appointment-dialog.service';
import { AppointmentDialogComponent } from './features/appointments/components/appointment-dialog/appointment-dialog.component';
import { ConfirmDialogComponent } from './shared/ui/confirm-dialog/confirm-dialog.component';
import { ToastContainerComponent } from './shared/ui/toast/toast-container.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    AppointmentDialogComponent,
    ConfirmDialogComponent,
    ToastContainerComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  protected readonly appointmentDialog = inject(AppointmentDialogService);
}
