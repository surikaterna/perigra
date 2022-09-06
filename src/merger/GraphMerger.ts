import EntityId from '../EntityId';
import EntityType from '../EntityType';
import Graph from '../Graph';
import Node from '../Node';
import Path from '../Path';
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

    // to keep updated path accumulated to changes
    const updatedPaths = new Map<EntityId, Path<PathType, NodeType>>();

    // const changedPaths =
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
              const updatedPath = updatedPaths.get(path.id) || path;
              const newPathNodes = updatedPath.nodes.reduce<Node<NodeType>[]>((result, n) => {
                if (n.id !== node.id) {
                  return [...result, n];
                }
                return [...result, headNode];
              }, []);
              const newPath = { ...updatedPath, nodes: newPathNodes };
              updatedPaths.set(path.id, newPath);
            });
          }
          break;
        case ActionType.Removed:
          if (!change.base) {
            throw new Error('No base available');
          }
          // change all the paths that link this node.
          // TODO: break out to separate changes
          // TODO: refatoring how to manage consecutive changes t.ex. multile replace nodes, delete nodes and add and replace again..
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
              updatedPaths.delete(path.id);
            });
          }
          state.entities.delete(change.base.id);
          break;
        default:
      }
    });

    updatedPaths.forEach((value) => {
      const currentPath = state.entities.get(value.id);
      state.entities.set(value.id, value);
      newChages.push({ type: ActionType.Replaced, base: currentPath, head: value });
    });

    const cache = state.cache.increment(newChages);
    return (this.head = Graph.initialize<NodeType, PathType>(state.entities, cache));
  }
}
