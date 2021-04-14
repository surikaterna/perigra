import EntityType from "../EntityType";
import Graph from "../Graph";
import Node from "../Node";
import GraphAction, { ActionType } from "../update/GraphAction";
// type applyer = <E>(action: GraphAction<E>) => void
// const applyers = {
//     [ActionType.Added]: (action:)
// }

/**
 * GraphUpgraders takes a base graph and allows incremental application of a list of actions to produce a new graph
 */
export default class GraphUpgrader<N, P> {
    // private base: Graph<N, P>;
    private head: Graph<N, P>;
    constructor(base: Graph<N, P>) {
        // this.base = 
        this.head = base;
    }

    increment(changes: GraphAction<N | P>[]) {
        const state = this.head._cloneState();
        changes.forEach(change => {
            switch (change.type) {
                case ActionType.Added:
                case ActionType.Replaced:
                    if (!change.head) {
                        throw new Error('No head available' + change);
                    }
                    state.entities.set(change.head.id, change.head);
                    break;
                case ActionType.Removed:
                    if (!change.base) {
                        throw new Error('No base available' + change);
                    }
                    const node = <Node<N>>change.base;

                    // change all the paths that link this node.
                    // TODO: break out to separate changes
                    if(node.type === EntityType.Node) {
                        this.head.getEntityPaths(node.id).forEach(path=>{
                            const newNodes = path.nodes.filter(n=>n.id !== node.id);
                            if(newNodes.length > 1) {
                                state.entities.set(path.id, {...path, nodes: newNodes});
                            } else {
                                state.entities.delete(path.id);
                            }
                        })
                    }
                    state.entities.delete(change.base.id);
                    break;
            }
        })

        const cache = state.cache.increment(changes);
        return this.head = Graph.initialize<N, P>(state.entities, cache);
    }
}