import EntityId from './EntityId';
import EntityType from './EntityType';

type Tags = Readonly<Record<string, any>>;
export default interface Entity {
    readonly id: EntityId;
    readonly type: EntityType;
    readonly tags: Tags;
}