import { Injectable, computed } from '@angular/core';

import { SEED_PROFESSIONALS } from '../data/seed';
import { Professional } from '../models';
import { EntityStore } from './entity.store';

@Injectable({ providedIn: 'root' })
export class ProfessionalsStore extends EntityStore<Professional> {
  readonly sorted = computed(() =>
    [...this.all()].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
  );

  constructor() {
    super('professionals', () => SEED_PROFESSIONALS);
  }
}
