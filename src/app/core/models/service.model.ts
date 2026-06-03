import { Entity } from './entity.model';

/** A bookable service (e.g. haircut, physiotherapy session). */
export interface Service extends Entity {
  readonly name: string;
  readonly durationMinutes: number;
  /** Price in BRL. */
  readonly price: number;
}
