import GraphUpdater from "./GraphUpdater";
import TagsUpdater from './TagsUpdater';

type Updater<T> = {
    [K in keyof T as `update${Capitalize<string & K>}`]: () => void
}

class EntityUpdater {
    private graphUpdater: GraphUpdater;

    tags() {
        return new TagsUpdater<this>(this);
    }

    end() {
        return this.graphUpdater;
    }
}