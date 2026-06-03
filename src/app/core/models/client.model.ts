import { Entity } from './entity.model';

export interface Client extends Entity {
  readonly name: string;
  /** Stored already masked, e.g. `(11) 98765-4321`. */
  readonly phone: string;
  readonly email: string;
  /** Stored already masked, e.g. `123.456.789-09`. */
  readonly cpf: string;
  readonly notes?: string;
}
