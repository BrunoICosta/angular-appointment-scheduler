import { Injectable, computed } from '@angular/core';

import { SEED_SERVICES } from '../data/seed';
import { Service } from '../models';
import { EntityStore } from './entity-store';

@Injectable({ providedIn: 'root' })
export class ServicesStore extends EntityStore<Service> {
  readonly sorted = computed(() =>
    [...this.all()].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
  );

  constructor() {
    super('services', () => SEED_SERVICES);
  }
}
