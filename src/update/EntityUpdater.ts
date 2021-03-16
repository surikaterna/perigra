import GraphUpdater from "./GraphUpdater";
import TagsUpdater from './TagsUpdater';
import Entity from '../Entity';


export default class EntityUpdater<T> { //extends Updater<T> {
    private graphUpdater: GraphUpdater<T>;
    private current: Entity<T>;
    constructor(graphUpdater: GraphUpdater<T>, current: Entity<T>) {
        // super();
        this.graphUpdater = graphUpdater;
        this.current = current;
    }

    tags() {
        return new TagsUpdater<this>(this);
    }

    end() {
        this.graphUpdater.replaceEntity(this.asEntity());
    }

    private asEntity() {
        return this.current;
    }
}