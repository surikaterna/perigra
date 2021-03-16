import EntityId from './EntityId';
import EntityType from './EntityType';

export interface EntityBaseState {
    readonly id: EntityId;
    readonly type: EntityType;
    readonly tags: Tags;
}

type Updater<T> = {
    [K in keyof T as `update${Capitalize<string & K>}`]: () => void
}
type Tags = Readonly<Record<string, any>>;

type Getter<T> = {
    readonly [K in keyof T]: T[K]
}

type Entity<T> = Getter<T & EntityBaseState>;// & Updater<T & EntityBaseState>;

export default Entity;
// export default interface Entity<T> extends Updater<T> {
//     readonly state: Readonly<T> | EntityBaseState;
// }