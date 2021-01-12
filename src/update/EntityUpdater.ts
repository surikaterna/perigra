import GraphUpdater from "./GraphUpdater";
import TagsUpdater from './TagsUpdater';

class EntityUpdater {
    private graphUpdater: GraphUpdater;

    tags() {
        return new TagsUpdater<this>(this);
    }

    end() {
        return this.graphUpdater;
    }
}