import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { MemoryStorage } from '../../../../../testing/memory-storage';
import { translocoTesting } from '../../../../../testing/transloco-testing';
import { Appointment } from '../../../../core/models';
import { AppointmentDialogState } from '../../../../core/scheduling/appointment-dialog.service';
import { AVAILABILITY_LATENCY_MS } from '../../../../core/scheduling/availability.service';
import { BROWSER_STORAGE, STORAGE_PREFIX } from '../../../../core/storage/storage.service';
import { AppointmentsStore } from '../../../../core/stores/appointments.store';
import { CLOCK } from '../../../../core/utils/clock.token';
import { OVERLAP_CHECK_DEBOUNCE_MS } from '../../data-access/appointment.validators';
import { AppointmentDialogComponent } from './appointment-dialog.component';

/** Long enough for the debounce plus the simulated availability lookup. */
const ASYNC_VALIDATION_MS = OVERLAP_CHECK_DEBOUNCE_MS + AVAILABILITY_LATENCY_MS;

// Monday 2026-06-15, 08:00. Carlos (pro-carlos) works Mon–Fri 08:00–17:00 in the seed.
const NOW = new Date(2026, 5, 15, 8, 0);

const existing: Appointment = {
  id: 'existing',
  professionalId: 'pro-carlos',
  clientId: 'cli-mariana',
  serviceId: 'svc-physio',
  start: new Date(2026, 5, 15, 10, 0).toISOString(),
  end: new Date(2026, 5, 15, 10, 50).toISOString(),
  status: 'scheduled',
};

describe('AppointmentDialogComponent', () => {
  let fixture: ComponentFixture<AppointmentDialogComponent>;
  let store: AppointmentsStore;
  let closed: jasmine.Spy;

  function create(state: AppointmentDialogState): void {
    fixture = TestBed.createComponent(AppointmentDialogComponent);
    fixture.componentRef.setInput('state', state);
    closed = jasmine.createSpy('closed');
    fixture.componentInstance.closed.subscribe(closed);
    fixture.detectChanges();
  }

  const query = <T extends Element>(selector: string) =>
    fixture.nativeElement.querySelector(selector) as T;

  function select(id: string, value: string): void {
    const element = query<HTMLSelectElement>(`#${id}`);
    element.value = value;
    element.dispatchEvent(new Event('change'));
  }

  function type(id: string, value: string): void {
    const element = query<HTMLInputElement>(`#${id}`);
    element.value = value;
    element.dispatchEvent(new Event('input'));
  }

  function submit(): void {
    query<HTMLFormElement>('#appointment-form').dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  }

  const slotMessage = () => query<HTMLElement>('#appointment-slot-error').textContent?.trim();

  beforeEach(() => {
    const storage = new MemoryStorage();
    storage.setItem(`${STORAGE_PREFIX}:appointments`, JSON.stringify([existing]));

    TestBed.configureTestingModule({
      imports: [AppointmentDialogComponent, translocoTesting()],
      providers: [
        { provide: BROWSER_STORAGE, useValue: storage },
        { provide: CLOCK, useValue: () => NOW },
      ],
    });
    store = TestBed.inject(AppointmentsStore);
  });

  it('pre-fills the slot from the draft and books a free time', fakeAsync(() => {
    create({
      mode: 'create',
      draft: {
        professionalId: 'pro-carlos',
        start: new Date(2026, 5, 15, 14, 0),
        end: new Date(2026, 5, 15, 14, 30),
      },
    });
    expect(query<HTMLInputElement>('#appointment-date').value).toBe('2026-06-15');
    expect(query<HTMLInputElement>('#appointment-start').value).toBe('14:00');

    select('appointment-client', 'cli-pedro');
    select('appointment-service', 'svc-physio');
    fixture.detectChanges();
    // Picking a service recalculates the end time from its duration (50 min).
    expect(query<HTMLInputElement>('#appointment-end').value).toBe('14:50');

    tick(ASYNC_VALIDATION_MS);
    fixture.detectChanges();
    expect(slotMessage()).toContain('Horário disponível');

    submit();
    const created = store.all().find((appointment) => appointment.clientId === 'cli-pedro');
    expect(created).toEqual(
      jasmine.objectContaining({
        professionalId: 'pro-carlos',
        serviceId: 'svc-physio',
        start: new Date(2026, 5, 15, 14, 0).toISOString(),
        end: new Date(2026, 5, 15, 14, 50).toISOString(),
        status: 'scheduled',
      }),
    );
    expect(closed).toHaveBeenCalled();
  }));

  it('blocks a slot that overlaps another appointment of the professional', fakeAsync(() => {
    create({ mode: 'create', draft: { professionalId: 'pro-carlos' } });
    select('appointment-client', 'cli-pedro');
    select('appointment-service', 'svc-physio');
    type('appointment-date', '2026-06-15');
    type('appointment-start', '10:30');
    fixture.detectChanges();
    expect(slotMessage()).toContain('Verificando disponibilidade');

    tick(ASYNC_VALIDATION_MS);
    fixture.detectChanges();
    expect(slotMessage()).toContain('Conflito com outro agendamento');
    expect(slotMessage()).toContain('10:00 às 10:50');

    submit();
    expect(store.count()).toBe(1);
    expect(closed).not.toHaveBeenCalled();
  }));

  it('shows cross-field errors for working hours and past times', fakeAsync(() => {
    create({ mode: 'create', draft: { professionalId: 'pro-carlos', serviceId: 'svc-physio' } });
    select('appointment-client', 'cli-pedro');

    type('appointment-date', '2026-06-15');
    type('appointment-start', '16:30');
    fixture.detectChanges();
    expect(slotMessage()).toContain('Fora do expediente de Carlos Mendes (08:00 às 17:00)');

    type('appointment-date', '2026-06-12');
    type('appointment-start', '10:00');
    fixture.detectChanges();
    expect(slotMessage()).toContain('já passou');
    tick(ASYNC_VALIDATION_MS);
  }));

  it('edits an existing appointment without conflicting with itself', fakeAsync(() => {
    create({ mode: 'edit', appointment: existing });
    expect(query('#appointment-status')).toBeTruthy();

    tick(ASYNC_VALIDATION_MS);
    fixture.detectChanges();
    expect(slotMessage()).toContain('Horário disponível');

    select('appointment-status', 'completed');
    tick(ASYNC_VALIDATION_MS);
    submit();
    expect(store.get('existing')?.status).toBe('completed');
  }));
});
