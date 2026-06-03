import { Appointment, Client, DaySchedule, Professional, Service, WorkingHours } from '../models';
import { addDays, addMinutes, startOfDay, timeToMinutes } from '../utils/date-time';

/**
 * Demo data loaded on the first visit. Appointments are generated relative to "now"
 * so the calendar and the dashboard always have something meaningful to show.
 */

const day = (start: string, end: string): DaySchedule => ({ start, end });

const weekdaysOnly = (start: string, end: string): WorkingHours => [
  null,
  day(start, end),
  day(start, end),
  day(start, end),
  day(start, end),
  day(start, end),
  null,
];

export const SEED_PROFESSIONALS: readonly Professional[] = [
  {
    id: 'pro-ana',
    name: 'Ana Ribeiro',
    specialty: 'Cabeleireira',
    color: '#e11d48',
    workingHours: [
      null,
      null,
      day('09:00', '18:00'),
      day('09:00', '18:00'),
      day('09:00', '18:00'),
      day('09:00', '18:00'),
      day('09:00', '14:00'),
    ],
  },
  {
    id: 'pro-carlos',
    name: 'Carlos Mendes',
    specialty: 'Fisioterapeuta',
    color: '#0d9488',
    workingHours: weekdaysOnly('08:00', '17:00'),
  },
  {
    id: 'pro-juliana',
    name: 'Juliana Alves',
    specialty: 'Esteticista',
    color: '#7c3aed',
    workingHours: [
      null,
      day('10:00', '19:00'),
      null,
      day('10:00', '19:00'),
      null,
      day('10:00', '19:00'),
      day('09:00', '13:00'),
    ],
  },
  {
    id: 'pro-rafael',
    name: 'Rafael Souza',
    specialty: 'Barbeiro',
    color: '#d97706',
    workingHours: [
      null,
      day('09:00', '19:00'),
      day('09:00', '19:00'),
      day('09:00', '19:00'),
      day('09:00', '19:00'),
      day('09:00', '19:00'),
      day('09:00', '15:00'),
    ],
  },
];

export const SEED_SERVICES: readonly Service[] = [
  { id: 'svc-haircut', name: 'Corte feminino', durationMinutes: 60, price: 120 },
  { id: 'svc-beard', name: 'Corte + barba', durationMinutes: 45, price: 75 },
  { id: 'svc-color', name: 'Coloração', durationMinutes: 120, price: 280 },
  { id: 'svc-physio', name: 'Sessão de fisioterapia', durationMinutes: 50, price: 150 },
  { id: 'svc-facial', name: 'Limpeza de pele', durationMinutes: 90, price: 190 },
  { id: 'svc-massage', name: 'Massagem relaxante', durationMinutes: 60, price: 160 },
];

export const SEED_CLIENTS: readonly Client[] = [
  {
    id: 'cli-mariana',
    name: 'Mariana Costa',
    phone: '(11) 98765-4321',
    email: 'mariana.costa@email.com',
    cpf: '529.982.247-25',
  },
  {
    id: 'cli-pedro',
    name: 'Pedro Henrique Lima',
    phone: '(21) 99812-3344',
    email: 'pedro.lima@email.com',
    cpf: '153.509.460-56',
  },
  {
    id: 'cli-beatriz',
    name: 'Beatriz Nogueira',
    phone: '(31) 98456-7788',
    email: 'bia.nogueira@email.com',
    cpf: '714.602.380-01',
    notes: 'Prefere horários pela manhã.',
  },
  {
    id: 'cli-lucas',
    name: 'Lucas Martins',
    phone: '(11) 3456-7890',
    email: 'lucas.martins@email.com',
    cpf: '862.145.731-80',
  },
  {
    id: 'cli-fernanda',
    name: 'Fernanda Rocha',
    phone: '(41) 99123-4567',
    email: 'fernanda.rocha@email.com',
    cpf: '390.533.447-05',
    notes: 'Alergia a produtos com amônia.',
  },
  {
    id: 'cli-gabriel',
    name: 'Gabriel Santos',
    phone: '(51) 98234-5678',
    email: 'gabriel.santos@email.com',
    cpf: '248.713.659-64',
  },
  {
    id: 'cli-camila',
    name: 'Camila Ferreira',
    phone: '(85) 98877-6655',
    email: 'camila.ferreira@email.com',
    cpf: '605.171.928-88',
  },
  {
    id: 'cli-thiago',
    name: 'Thiago Oliveira',
    phone: '(19) 99654-3210',
    email: 'thiago.oliveira@email.com',
    cpf: '917.364.028-03',
  },
];

/** Which services each seeded professional usually performs. */
const SERVICES_BY_PROFESSIONAL: Readonly<Record<string, readonly string[]>> = {
  'pro-ana': ['svc-haircut', 'svc-color'],
  'pro-carlos': ['svc-physio', 'svc-massage'],
  'pro-juliana': ['svc-facial', 'svc-massage'],
  'pro-rafael': ['svc-beard', 'svc-haircut'],
};

/** Deterministic PRNG (mulberry32) so the generated agenda is stable for a given day. */
function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Builds a realistic agenda from one week ago to two weeks ahead: every professional gets
 * a few non-overlapping appointments inside their working hours on the days they work.
 */
export function buildSeedAppointments(now: Date): Appointment[] {
  const appointments: Appointment[] = [];
  const today = startOfDay(now);
  const gaps = [0, 15, 30, 60, 90];
  let sequence = 0;

  for (let offset = -7; offset <= 14; offset++) {
    const date = addDays(today, offset);
    const random = seededRandom(
      date.getFullYear() * 10_000 + date.getMonth() * 100 + date.getDate(),
    );

    SEED_PROFESSIONALS.forEach((professional) => {
      const schedule = professional.workingHours[date.getDay()];
      if (!schedule) {
        return;
      }
      const services = SERVICES_BY_PROFESSIONAL[professional.id] ?? [];
      const close = timeToMinutes(schedule.end);
      let cursor = timeToMinutes(schedule.start) + gaps[Math.floor(random() * gaps.length)];
      let booked = 0;
      const dailyLimit = 2 + Math.floor(random() * 3);

      while (booked < dailyLimit) {
        const service = SEED_SERVICES.find(
          (item) => item.id === services[Math.floor(random() * services.length)],
        );
        if (!service || cursor + service.durationMinutes > close) {
          break;
        }
        const start = addMinutes(date, cursor);
        const end = addMinutes(start, service.durationMinutes);
        const client = SEED_CLIENTS[(sequence * 3 + booked) % SEED_CLIENTS.length];
        const isPast = end.getTime() < now.getTime();

        appointments.push({
          id: `seed-${sequence}`,
          professionalId: professional.id,
          clientId: client.id,
          serviceId: service.id,
          start: start.toISOString(),
          end: end.toISOString(),
          status: isPast ? (random() < 0.12 ? 'cancelled' : 'completed') : 'scheduled',
        });

        sequence++;
        booked++;
        cursor += service.durationMinutes + gaps[Math.floor(random() * gaps.length)];
      }
    });
  }

  return appointments;
}
