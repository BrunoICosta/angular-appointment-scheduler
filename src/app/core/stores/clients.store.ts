import { Injectable, computed } from '@angular/core';

import { SEED_CLIENTS } from '../data/seed';
import { Client } from '../models';
import { EntityStore } from './entity.store';

@Injectable({ providedIn: 'root' })
export class ClientsStore extends EntityStore<Client> {
  readonly sorted = computed(() =>
    [...this.all()].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
  );

  constructor() {
    super('clients', () => SEED_CLIENTS);
  }

  /** True when another client already uses the given CPF (digits are compared, not masks). */
  isCpfTaken(cpf: string, exceptId?: string): boolean {
    const digits = cpf.replace(/\D/g, '');
    return this.all().some(
      (client) => client.id !== exceptId && client.cpf.replace(/\D/g, '') === digits,
    );
  }
}
