import TagsUpdater from './TagsUpdater';
import Entity from '../Entity';


export default class EntityUpdater<T, ParentUpdaterType> { //extends Updater<T> {
    private parentUpdater: ParentUpdaterType;
    private current: Entity<T>;
    constructor(parentUpdater: ParentUpdaterType, current: Entity<T>) {
        // super();
        this.parentUpdater = parentUpdater;
        this.current = current;
    }

    tags() {
        return new TagsUpdater<this>(this);
    }

    end() : ParentUpdaterType{
        this.parentUpdater.replaceEntity(this.asEntity());
        return this.parentUpdater;
    }

    private asEntity() {
        return this.current;
    }
}