import Graph from "../Graph";
import GraphAction, { ActionType } from "../update/GraphAction";
type applyer = <E>(entity: E) => void
const applyers = {
    [ActionType.Added]: () =>
}

/**
 * GraphUpgraders takes a base graph and allows incremental application of a list of actions to produce a new graph
 */
class GraphUpgrader<N, P> {
    private base: Graph<N, P>;
    constructor(base: Graph<N, P>) {
        this.base = base;
    }

    increment(...changes: GraphAction<N | P>[]) {
        const baseState = this.base._cloneState();

    }
}