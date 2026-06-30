import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { MemoryStorage } from '../../../../../testing/memory-storage';
import { translocoTesting } from '../../../../../testing/transloco-testing';
import { AppLanguage } from '../../../../core/i18n/languages';
import { LanguageService } from '../../../../core/i18n/language.service';
import { Appointment, AppointmentStatus } from '../../../../core/models';
import { AppointmentDialogService } from '../../../../core/scheduling/appointment-dialog.service';
import { BROWSER_STORAGE, STORAGE_PREFIX } from '../../../../core/storage/storage.service';
import { CLOCK } from '../../../../core/utils/clock.token';
import { DashboardPageComponent } from './dashboard-page.component';

// Monday 2026-06-15, 09:00
const NOW = new Date(2026, 5, 15, 9, 0);

const appointment = (
  id: string,
  clientId: string,
  start: Date,
  status: AppointmentStatus = 'scheduled',
): Appointment => ({
  id,
  professionalId: 'pro-carlos',
  clientId,
  serviceId: 'svc-physio',
  start: start.toISOString(),
  end: new Date(start.getTime() + 50 * 60_000).toISOString(),
  status,
});

describe('DashboardPageComponent', () => {
  function render(appointments: Appointment[], language: AppLanguage = 'pt-BR') {
    const storage = new MemoryStorage();
    storage.setItem(`${STORAGE_PREFIX}:appointments`, JSON.stringify(appointments));
    storage.setItem(`${STORAGE_PREFIX}:language`, JSON.stringify(language));
    TestBed.configureTestingModule({
      imports: [DashboardPageComponent, translocoTesting()],
      providers: [
        provideRouter([]),
        { provide: BROWSER_STORAGE, useValue: storage },
        { provide: CLOCK, useValue: () => NOW },
      ],
    });
    // Same as the app initializer: activates the saved language in Transloco.
    TestBed.inject(LanguageService).init().subscribe();
    const fixture = TestBed.createComponent(DashboardPageComponent);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('lists upcoming appointments grouped by day, soonest first', () => {
    const element = render([
      appointment('tomorrow', 'cli-pedro', new Date(2026, 5, 16, 8, 0)),
      appointment('today', 'cli-mariana', new Date(2026, 5, 15, 14, 0)),
      appointment('past', 'cli-lucas', new Date(2026, 5, 15, 7, 0), 'completed'),
      appointment('cancelled', 'cli-camila', new Date(2026, 5, 15, 15, 0), 'cancelled'),
    ]);

    const days = [...element.querySelectorAll('.upcoming__day')].map((h) => h.textContent?.trim());
    expect(days).toEqual(['Hoje', 'Amanhã']);

    const names = [...element.querySelectorAll('.upcoming__info strong')].map((n) =>
      n.textContent?.trim(),
    );
    expect(names).toEqual(['Mariana Costa', 'Pedro Henrique Lima']);
  });

  it('shows weekly stats with locale-formatted revenue', () => {
    const element = render([
      appointment('a', 'cli-pedro', new Date(2026, 5, 15, 14, 0)),
      appointment('b', 'cli-pedro', new Date(2026, 5, 16, 14, 0)),
      appointment('c', 'cli-pedro', new Date(2026, 5, 17, 14, 0), 'cancelled'),
    ]);
    const values = [...element.querySelectorAll('.stat__value')].map((v) => v.textContent?.trim());
    // today, this week (excluding cancelled), revenue (2 x R$ 150), clients
    expect(values[0]).toBe('1');
    expect(values[1]).toBe('2');
    expect(values[2]?.replace(/\s/g, ' ')).toBe('R$ 300,00');
  });

  it('shows an empty state when nothing is scheduled', () => {
    const element = render([]);
    expect(element.querySelector('.empty-state')?.textContent).toContain(
      'Nenhum atendimento agendado',
    );
  });

  it('opens the appointment dialog from an upcoming item', () => {
    const element = render([appointment('today', 'cli-mariana', new Date(2026, 5, 15, 14, 0))]);
    const dialog = TestBed.inject(AppointmentDialogService);

    element.querySelector<HTMLButtonElement>('.upcoming__item')?.click();

    expect(dialog.state()).toEqual(
      jasmine.objectContaining({
        mode: 'edit',
        appointment: jasmine.objectContaining({ id: 'today' }),
      }),
    );
  });

  it('renders in English with en-US date and currency formatting', () => {
    const element = render(
      [
        appointment('today', 'cli-mariana', new Date(2026, 5, 15, 14, 0)),
        appointment('tomorrow', 'cli-pedro', new Date(2026, 5, 16, 8, 0)),
      ],
      'en',
    );

    expect(element.querySelector('h1')?.textContent).toContain('Overview');
    expect(element.querySelector('#upcoming-title')?.textContent).toContain(
      'Upcoming appointments',
    );
    expect(element.textContent).toContain('Monday, June 15, 2026');
    const days = [...element.querySelectorAll('.upcoming__day')].map((h) => h.textContent?.trim());
    expect(days).toEqual(['Today', 'Tomorrow']);
    expect(element.querySelector('.upcoming__time strong')?.textContent?.trim()).toBe('2:00 PM');
    const revenue = element.querySelectorAll('.stat__value')[2]?.textContent?.trim();
    expect(revenue).toBe('R$300.00');
  });
});
