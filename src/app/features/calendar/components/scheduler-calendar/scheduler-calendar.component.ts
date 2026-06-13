import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { BusinessHoursInput, CalendarOptions, EventClickArg, EventInput } from '@fullcalendar/core';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';

import { AppLanguage } from '../../../../core/i18n/languages';
import { mediaQuerySignal } from '../../../../shared/utils/media-query.utils';

/**
 * Thin wrapper around FullCalendar. It owns every FullCalendar-specific option so the page
 * only deals with plain inputs/outputs, and it is rendered through `@defer` so the heavy
 * library lives in its own lazy chunk.
 */
@Component({
  selector: 'app-scheduler-calendar',
  imports: [FullCalendarModule],
  template: `<full-calendar [options]="options()" [events]="events()" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SchedulerCalendarComponent {
  readonly events = input.required<EventInput[]>();
  readonly businessHours = input<BusinessHoursInput>(true);
  readonly language = input.required<AppLanguage>();

  readonly appointmentClicked = output<string>();

  private readonly compact = mediaQuerySignal('(max-width: 767px)');

  protected readonly options = computed<CalendarOptions>(() => {
    const compact = this.compact();
    return {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      locales: [ptBrLocale],
      locale: this.language() === 'pt-BR' ? 'pt-br' : 'en',
      initialView: compact ? 'timeGridDay' : 'timeGridWeek',
      headerToolbar: compact
        ? { left: 'prev,next', center: 'title', right: 'today' }
        : {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          },
      footerToolbar: compact ? { center: 'dayGridMonth,timeGridWeek,timeGridDay' } : undefined,
      height: 'auto',
      firstDay: 1,
      allDaySlot: false,
      nowIndicator: true,
      slotMinTime: '07:00:00',
      slotMaxTime: '21:00:00',
      slotDuration: '00:30:00',
      snapDuration: '00:15:00',
      scrollTime: '08:00:00',
      expandRows: true,
      dayMaxEvents: 3,
      businessHours: this.businessHours(),
      eventTimeFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
      slotLabelFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
      eventClick: (info: EventClickArg) => {
        info.jsEvent.preventDefault();
        this.appointmentClicked.emit(info.event.id);
      },
    };
  });
}
