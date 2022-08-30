import EntityType from '../EntityType';
import Graph from '../Graph';
import Node from '../Node';
import GraphAction, { ActionType } from '../update/GraphAction';
// type applyer = <E>(action: GraphAction<E>) => void
// const applyers = {
//     [ActionType.Added]: (action:)
// }

/**
 * GraphUpgraders takes a base graph and allows incremental application of a list of actions to produce a new graph
 */
export default class GraphUpgrader<NodeType, PathType> {
  // private base: Graph<NodeType, P>;
  private head: Graph<NodeType, PathType>;
  constructor(base: Graph<NodeType, PathType>) {
    // this.base =
    this.head = base;
  }

  increment(changes: GraphAction<NodeType | PathType>[]) {
    const state = this.head._cloneState();
    changes.forEach((change) => {
      const node = change.base as Node<NodeType>;
      const headNode = change.head as Node<NodeType>;
      switch (change.type) {
        case ActionType.Added:
          if (!change.head) {
            throw new Error('No head available');
          }
          state.entities.set(change.head.id, change.head);
          break;
        case ActionType.Replaced:
          if (!headNode || !node) {
            throw new Error('No head available');
          }
          state.entities.set(headNode.id, headNode);
          if (node.type === EntityType.Node) {
            this.head.getEntityPaths(node.id).forEach((path) => {
              const nodeIndex = path.nodes.findIndex((n) => n.id === node.id);
              if (nodeIndex > -1) {
                const newNodes = [...path.nodes] as Node<NodeType>[];
                newNodes.splice(nodeIndex, 1, headNode);
                state.entities.set(path.id, { ...path, nodes: newNodes });
              }
            });
          }
          break;
        case ActionType.Removed:
          if (!change.base) {
            throw new Error('No base available');
          }
          // change all the paths that link this node.
          // TODO: break out to separate changes
          if (node.type === EntityType.Node) {
            this.head.getEntityPaths(node.id).forEach((path) => {
              const newNodes = path.nodes.filter((n) => n.id !== node.id);
              if (newNodes.length > 1) {
                state.entities.set(path.id, { ...path, nodes: newNodes });
              } else {
                state.entities.delete(path.id);
              }
            });
          }
          state.entities.delete(change.base.id);
          break;
        default:
      }
    });

    const cache = state.cache.increment(changes);
    return (this.head = Graph.initialize<NodeType, PathType>(state.entities, cache));
  }
}
