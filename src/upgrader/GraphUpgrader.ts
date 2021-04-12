import Graph from "../Graph";
import GraphAction, { ActionType } from "../update/GraphAction";
// type applyer = <E>(action: GraphAction<E>) => void
// const applyers = {
//     [ActionType.Added]: (action:)
// }

/**
 * GraphUpgraders takes a base graph and allows incremental application of a list of actions to produce a new graph
 */
export default class GraphUpgrader<N, P> {
    private base: Graph<N, P>;
    constructor(base: Graph<N, P>) {
        this.base = base;
    }

    increment(changes: GraphAction<N | P>[]) {
        const state = this.base._cloneState();
        changes.forEach(val => {
            switch (val.type) {
                case ActionType.Added:
                case ActionType.Replaced:
                    if (!val.head) {
                        throw new Error('No head available' + val);
                    }
                    state.entities.set(val.head.id, val.head);
                    break;
                case ActionType.Removed:
                    if (!val.base) {
                        throw new Error('No base available' + val);
                    }
                    state.entities.delete(val.base.id);
                    break;
            }
        })
        // TODO: rebuild cache
        return Graph.initialize<N, P>(state.entities, state.cachedPaths);
    }
}