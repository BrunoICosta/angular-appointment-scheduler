import { Signal, computed, inject, signal } from '@angular/core';

import { Entity, NewEntity } from '../models';
import { StorageService } from '../storage/storage.service';
import { createId } from '../utils/id';

/**
 * Signal-based in-memory collection persisted to `localStorage`.
 *
 * The app has no backend, so each store owns one collection, hydrates it from storage
 * (or from seed data on the first visit) and writes it back after every mutation.
 * Consumers only see read-only signals, which keeps updates flowing through the store API.
 */
export abstract class EntityStore<T extends Entity> {
  private readonly storage = inject(StorageService);
  private readonly state = signal<readonly T[]>([]);

  /** All entities, in insertion order. */
  readonly all: Signal<readonly T[]> = this.state.asReadonly();
  readonly count = computed(() => this.state().length);
  /** Id -> entity lookup, recomputed only when the collection changes. */
  readonly byId = computed(() => new Map(this.state().map((item) => [item.id, item])));

  protected constructor(
    private readonly storageKey: string,
    private readonly seed: () => readonly T[],
  ) {
    const stored = this.storage.read<T[]>(this.storageKey);
    if (Array.isArray(stored)) {
      this.state.set(stored);
    } else {
      this.replaceAll(this.seed());
    }
  }

  get(id: string | null | undefined): T | undefined {
    return id ? this.byId().get(id) : undefined;
  }

  add(data: NewEntity<T>): T {
    const entity = { ...data, id: createId() } as T;
    this.commit([...this.state(), entity]);
    return entity;
  }

  update(id: string, changes: Partial<NewEntity<T>>): T | undefined {
    const current = this.get(id);
    if (!current) {
      return undefined;
    }
    const updated = { ...current, ...changes, id } as T;
    this.commit(this.state().map((item) => (item.id === id ? updated : item)));
    return updated;
  }

  remove(id: string): void {
    this.commit(this.state().filter((item) => item.id !== id));
  }

  removeWhere(predicate: (item: T) => boolean): void {
    this.commit(this.state().filter((item) => !predicate(item)));
  }

  /** Replaces the whole collection, e.g. when restoring demo data. */
  replaceAll(items: readonly T[]): void {
    this.commit([...items]);
  }

  /** Restores the seed data, discarding user changes. */
  resetToSeed(): void {
    this.replaceAll(this.seed());
  }

  private commit(items: readonly T[]): void {
    this.state.set(items);
    this.storage.write(this.storageKey, items);
  }
}
