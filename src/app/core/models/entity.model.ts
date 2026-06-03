/** Every persisted entity is identified by a string id. */
export interface Entity {
  readonly id: string;
}

/** Payload accepted when creating an entity: everything except the generated id. */
export type NewEntity<T extends Entity> = Omit<T, 'id'>;
