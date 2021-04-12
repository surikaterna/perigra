import EntityId from './EntityId';
import EntityType from './EntityType';

/**
 * Not allowed to be changed by client API
 */
export interface EntityStateCannotChange {
    readonly id: EntityId;
    readonly type: EntityType;
}

export interface EntityBaseState extends EntityStateCannotChange {
    readonly tags: Tags;
}

type Tags = Readonly<Record<string, any>>;

type Getter<T> = {
    readonly [K in keyof T]: T[K]
}

type Entity<T> = Getter<T & EntityBaseState>;  

export default Entity;