import EntityId from './EntityId';
import EntityType from './EntityType';

interface Tags { };
export default interface Entity {
    readonly id: EntityId;
    readonly type: EntityType;
    readonly tags: Tags;
}