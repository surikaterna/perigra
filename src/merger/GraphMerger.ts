import EntityId from '../EntityId';
import EntityType from '../EntityType';
import Graph from '../Graph';
import Node from '../Node';
import Path from '../Path';
import Relation from '../Relation';
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

  increment(changes: GraphAction<NodeType | PathType | Relation<PathType, NodeType>>[]) {
    const state = this.head._cloneState();
    const newChanges = [...changes];

    // to keep updated path accumulated to changes
    const toBeChangedPaths = new Map<EntityId, Path<PathType, NodeType>>();
    const toBeRemovedPaths = new Map<EntityId, Path<PathType, NodeType>>();

    // const changedPaths =
    changes.forEach((change) => {
      const isRelation = (change.head?.type ?? change.base?.type) === EntityType.Relation;
      const isPath = (change.head?.type ?? change.base?.type) === EntityType.Path;

      const node = change.base as Node<NodeType>; // current node
      const headNode = change.head as Node<NodeType>; // new node
      switch (change.type) {
        case ActionType.Added:
          if (!change.head) {
            throw new Error('No head available');
          }

          if (isRelation) {
            state.entities.set(change.head.id, change.head);
          } else if (isPath) {
            const path = change.head as Path<PathType, NodeType>;
            toBeChangedPaths.set(path.id, path);
            toBeRemovedPaths.delete(path.id);
          } else {
            state.entities.set(change.head.id, change.head);
          }
          break;
        case ActionType.Replaced:
          if (!headNode || !node) {
            throw new Error('No head available');
          }

          if (isRelation) {
            state.entities.set(node.id, headNode);
          } else if (isPath) {
            const path = change.head as Path<PathType, NodeType>;
            toBeChangedPaths.set(path.id, path);
            toBeRemovedPaths.delete(path.id);
          } else {
            state.entities.set(node.id, headNode);
            this.head.getEntityPaths(node.id).forEach((entityPath) => {
              const path = toBeChangedPaths.get(entityPath.id) || entityPath;
              const newPathNodes = path.nodes.reduce<Node<NodeType>[]>((result, n) => {
                if (n.id !== node.id) {
                  return [...result, n];
                }
                return [...result, headNode];
              }, []);
              const newPath = { ...path, nodes: newPathNodes };
              toBeChangedPaths.set(path.id, newPath);
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
          if (isRelation) {
            state.entities.delete(change.base.id);
            // TODO: to implement update to getEntityRelations
          } else if (isPath) {
            const path = change.base as Path<PathType, NodeType>;
            toBeRemovedPaths.set(path.id, path);
          } else {
            state.entities.delete(change.base.id);
            this.head.getEntityPaths(node.id).forEach((entityPath) => {
              const path = toBeChangedPaths.get(entityPath.id) || entityPath;
              const newNodes = path.nodes.filter((n) => n.id !== node.id);
              const newPath = { ...path, nodes: newNodes };
              toBeChangedPaths.set(path.id, newPath);
            });
          }
          break;
        default:
      }
    });

    toBeChangedPaths.forEach((value) => {
      const currentPath = state.entities.get(value.id);
      if (value.nodes.length === 0) {
        state.entities.delete(value.id);
        return;
      }
      state.entities.set(value.id, value);
      // should this change be put to the cache builder to replace path ?
      if (currentPath) {
        newChanges.push({ type: ActionType.Replaced, base: currentPath, head: value });
      }
    });

    toBeRemovedPaths.forEach((value) => {
      state.entities.delete(value.id);
      // should this change be put to the cache builder to replace path ?
      newChanges.push({ type: ActionType.Removed, base: value });
    });

    const cache = state.cache.increment(newChanges);
    return (this.head = Graph.initialize<NodeType, PathType>(state.entities, cache));
  }
}
