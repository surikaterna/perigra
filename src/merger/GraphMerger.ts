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
    const newChages = [...changes];
    changes.forEach((change) => {
      const node = change.base as Node<NodeType>; // current node
      const headNode = change.head as Node<NodeType>; // new node
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
          state.entities.set(node.id, headNode);
          if (node.type === EntityType.Node) {
            this.head.getEntityPaths(node.id).forEach((path) => {
              const newPathNodes = path.nodes.reduce<Node<NodeType>[]>((result, n) => {
                if (n.id !== headNode.id) {
                  return [...result, n];
                }
                return [...result, headNode];
              }, []);

              const newPath = { ...path, nodes: newPathNodes };
              state.entities.set(path.id, newPath);
              newChages.push({ type: ActionType.Replaced, base: path, head: newPath });
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
                const newPath = { ...path, nodes: newNodes };
                state.entities.set(path.id, newPath);
                newChages.push({ type: ActionType.Replaced, base: path, head: newPath });
              } else {
                state.entities.delete(path.id);
                newChages.push({ type: ActionType.Removed, base: path });
              }
            });
          }
          state.entities.delete(change.base.id);
          break;
        default:
      }
    });

    const cache = state.cache.increment(newChages);
    return (this.head = Graph.initialize<NodeType, PathType>(state.entities, cache));
  }
}
