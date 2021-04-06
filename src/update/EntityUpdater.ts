import TagsUpdater from './TagsUpdater';
import Entity from '../Entity';


export default class EntityUpdater<T, ParentUpdaterType> extends Updater<T> {
    private current: Entity<T>;
    private _end: (entity: Entity<T>) => ParentUpdaterType;
    constructor(current: Entity<T>, end: (entity: Entity<T>) => ParentUpdaterType) {
        // super();
        this.current = current;
        this._end = end;
    }

    tags() {
        return new TagsUpdater<this>(this);
    }

    end(): ParentUpdaterType {

        return this._end(this.current);
    }

    private asEntity() {
        return this.current;
    }
}