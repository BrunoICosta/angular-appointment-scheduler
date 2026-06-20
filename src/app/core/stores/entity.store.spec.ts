import { TestBed } from '@angular/core/testing';

import { MemoryStorage } from '../../../testing/memory-storage';
import { SEED_CLIENTS } from '../data/seed';
import { Client } from '../models';
import { BROWSER_STORAGE, STORAGE_PREFIX } from '../storage/storage.service';
import { ClientsStore } from './clients.store';

const KEY = `${STORAGE_PREFIX}:clients`;

const newClient: Omit<Client, 'id'> = {
  name: 'Joana Prado',
  phone: '(11) 91234-5678',
  email: 'joana@email.com',
  cpf: '476.293.815-73',
};

describe('EntityStore (via ClientsStore)', () => {
  let storage: MemoryStorage;

  function createStore(): ClientsStore {
    TestBed.configureTestingModule({
      providers: [{ provide: BROWSER_STORAGE, useValue: storage }],
    });
    return TestBed.inject(ClientsStore);
  }

  beforeEach(() => {
    storage = new MemoryStorage();
  });

  it('loads seed data on the first visit and persists it', () => {
    const store = createStore();
    expect(store.count()).toBe(SEED_CLIENTS.length);
    expect(JSON.parse(storage.getItem(KEY) ?? '[]').length).toBe(SEED_CLIENTS.length);
  });

  it('hydrates from storage instead of seeding', () => {
    storage.setItem(KEY, JSON.stringify([{ ...newClient, id: 'stored' }]));
    const store = createStore();
    expect(store.all().map((client) => client.id)).toEqual(['stored']);
  });

  it('falls back to seed data when the stored JSON is corrupted', () => {
    storage.setItem(KEY, '{not json');
    const store = createStore();
    expect(store.count()).toBe(SEED_CLIENTS.length);
  });

  it('adds, updates and removes entities, persisting each change', () => {
    storage.setItem(KEY, '[]');
    const store = createStore();

    const created = store.add(newClient);
    expect(created.id).toBeTruthy();
    expect(store.get(created.id)?.name).toBe('Joana Prado');

    store.update(created.id, { name: 'Joana P. Prado' });
    expect(store.get(created.id)?.name).toBe('Joana P. Prado');
    expect(JSON.parse(storage.getItem(KEY) ?? '[]')[0].name).toBe('Joana P. Prado');

    store.remove(created.id);
    expect(store.count()).toBe(0);
    expect(storage.getItem(KEY)).toBe('[]');
  });

  it('returns undefined when updating an unknown id', () => {
    const store = createStore();
    expect(store.update('missing', { name: 'x' })).toBeUndefined();
  });

  it('restores the seed on reset', () => {
    storage.setItem(KEY, '[]');
    const store = createStore();
    store.resetToSeed();
    expect(store.count()).toBe(SEED_CLIENTS.length);
  });

  it('keeps working in memory when storage is unavailable', () => {
    TestBed.configureTestingModule({ providers: [{ provide: BROWSER_STORAGE, useValue: null }] });
    const store = TestBed.inject(ClientsStore);
    store.add(newClient);
    expect(store.count()).toBe(SEED_CLIENTS.length + 1);
  });

  describe('ClientsStore.isCpfTaken', () => {
    it('compares digits regardless of mask and ignores the edited client', () => {
      const store = createStore();
      const [first] = SEED_CLIENTS;
      expect(store.isCpfTaken(first.cpf.replace(/\D/g, ''))).toBeTrue();
      expect(store.isCpfTaken(first.cpf, first.id)).toBeFalse();
      expect(store.isCpfTaken('476.293.815-73')).toBeFalse();
    });
  });
});
