import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  untracked,
  viewChild,
} from '@angular/core';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
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
import listPlugin from '@fullcalendar/list';
import timeGridPlugin from '@fullcalendar/timegrid';

import { AppLanguage } from '../../../../core/i18n/languages';
import { CLOCK } from '../../../../core/utils/clock.token';
import { mediaQuerySignal } from '../../../../shared/utils/media-query.utils';
import { AppointmentMove, SlotSelection } from './scheduler-calendar.models';

/** Phones get a single-day grid by default; larger screens get the week. */
const COMPACT_QUERY = '(max-width: 767px)';
const COMPACT_VIEW = 'timeGridDay';
const WIDE_VIEW = 'timeGridWeek';

/**
 * Thin wrapper around FullCalendar. It owns every FullCalendar-specific option so the page
 * only deals with plain inputs/outputs, and it is rendered through `@defer` so the heavy
 * library lives in its own lazy chunk.
 */
@Component({
  selector: 'app-scheduler-calendar',
  imports: [FullCalendarModule],
  template: `<full-calendar [options]="options()" [events]="events()" />`,
  // Grid/flex children default to `min-width: auto`; without this a wide toolbar could
  // stretch the page horizontally on phones.
  host: { style: 'display: block; min-width: 0' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SchedulerCalendarComponent {
  readonly events = input.required<EventInput[]>();
  readonly businessHours = input<BusinessHoursInput>(true);
  readonly language = input.required<AppLanguage>();

  readonly appointmentClicked = output<string>();
  readonly slotSelected = output<SlotSelection>();
  readonly appointmentMoved = output<AppointmentMove>();

  private readonly compact = mediaQuerySignal(COMPACT_QUERY);
  private readonly clock = inject(CLOCK);
  private readonly calendar = viewChild(FullCalendarComponent);

  constructor() {
    // `initialView` only applies once, so follow breakpoint changes (rotation, resizing).
    let previous: boolean | undefined;
    effect(() => {
      const compact = this.compact();
      const calendar = this.calendar();
      if (!calendar) {
        return;
      }
      if (previous !== undefined && previous !== compact) {
        untracked(() => calendar.getApi().changeView(compact ? COMPACT_VIEW : WIDE_VIEW));
      }
      previous = compact;
    });
  }

  protected readonly options = computed<CalendarOptions>(() => {
    const compact = this.compact();
    return {
      plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
      locales: [ptBrLocale],
      locale: this.language() === 'pt-BR' ? 'pt-br' : 'en',
      initialView: compact ? COMPACT_VIEW : WIDE_VIEW,
      // Phones: navigation on top, the view switcher in a second row below the grid,
      // and the agenda list instead of the cramped week grid.
      headerToolbar: compact
        ? { left: 'prev,next', center: 'title', right: 'today' }
        : {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
          },
      footerToolbar: compact ? { center: 'timeGridDay,listWeek,dayGridMonth' } : undefined,
      // Let the page scroll: no inner scroller competing with it on touch screens.
      height: 'auto',
      // Our top bar is already sticky, a sticky day header would slide under it.
      stickyHeaderDates: false,
      firstDay: 1,
      allDaySlot: false,
      nowIndicator: true,
      slotMinTime: '07:00:00',
      slotMaxTime: '21:00:00',
      slotDuration: '00:30:00',
      snapDuration: '00:15:00',
      scrollTime: '08:00:00',
      expandRows: true,
      dayMaxEvents: compact ? 2 : 3,
      businessHours: this.businessHours(),
      eventTimeFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
      slotLabelFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
      selectable: true,
      selectMirror: true,
      editable: true,
      eventDurationEditable: true,
      // Touch: a short press scrolls the page, a long press picks up an event or a slot.
      longPressDelay: 350,
      eventLongPressDelay: 350,
      selectLongPressDelay: 350,
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
