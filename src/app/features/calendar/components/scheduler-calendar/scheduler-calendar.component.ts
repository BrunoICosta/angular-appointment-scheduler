import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import {
  BusinessHoursInput,
  CalendarOptions,
  DateSelectArg,
  DateSpanApi,
  EventClickArg,
  EventDropArg,
  EventInput,
} from '@fullcalendar/core';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { EventResizeDoneArg } from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';

import { AppLanguage } from '../../../../core/i18n/languages';
import { CLOCK } from '../../../../core/utils/clock.token';
import { mediaQuerySignal } from '../../../../shared/utils/media-query.utils';

export interface SlotSelection {
  readonly start: Date;
  readonly end: Date;
  /** True when picked in the month view, where only the day is known. */
  readonly allDay: boolean;
}

export interface AppointmentMove {
  readonly id: string;
  readonly start: Date;
  readonly end: Date;
  /** Puts the event back where it was; called when the move breaks a scheduling rule. */
  readonly revert: () => void;
}

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
  readonly slotSelected = output<SlotSelection>();
  readonly appointmentMoved = output<AppointmentMove>();

  private readonly compact = mediaQuerySignal('(max-width: 767px)');
  private readonly clock = inject(CLOCK);

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
      selectable: true,
      selectMirror: true,
      editable: true,
      eventDurationEditable: true,
      longPressDelay: 350,
      // Past slots can never be booked, so do not even offer the selection.
      // In the month view a whole day is selected: today stays selectable.
      selectAllow: (span: DateSpanApi) =>
        (span.allDay ? span.end : span.start).getTime() > this.clock().getTime(),
      select: (info: DateSelectArg) => {
        info.view.calendar.unselect();
        this.slotSelected.emit({ start: info.start, end: info.end, allDay: info.allDay });
      },
      eventDrop: (info: EventDropArg) => this.emitMove(info),
      eventResize: (info: EventResizeDoneArg) => this.emitMove(info),
      eventClick: (info: EventClickArg) => {
        info.jsEvent.preventDefault();
        this.appointmentClicked.emit(info.event.id);
      },
    };
  });

  private emitMove(info: EventDropArg | EventResizeDoneArg): void {
    const { event } = info;
    if (!event.start || !event.end) {
      info.revert();
      return;
    }
    this.appointmentMoved.emit({
      id: event.id,
      start: event.start,
      end: event.end,
      revert: () => info.revert(),
    });
  }
}
