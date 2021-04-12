import Entity from "../Entity";

export enum ActionType {
    Added,
    Replaced,
    Removed
}

type GraphAction<T> = {
    type: ActionType,
    base?: Entity<T>,
    head?: Entity<T>,
}
export default GraphAction;