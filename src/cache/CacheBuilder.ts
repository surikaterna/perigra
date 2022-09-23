import Entity from '../Entity';
import EntityId from '../EntityId';
import EntityType from '../EntityType';
import deepCloneMap from '../helper/deepCloneMap';
import Path from '../Path';
import GraphAction, { ActionType } from '../update/GraphAction';
import Cache from './Cache';

export default class CacheBuilder {
  buildCache<NodeType, PathType>(entities: Map<EntityId, Entity<NodeType | PathType>>, ids: EntityId[]) {
    const idArray = ids;

    const state = idArray.reduce((map, id) => {
      const entity = entities.get(id);
      if (entity && entity.type === EntityType.Path) {
        const path = entity as Path<PathType, NodeType>;
        this.getUniqueNodes(path).forEach((node) => {
          const paths = map.get(node.id) || [];
          paths.push(path);
          map.set(node.id, paths);
        });
      }
      return map;
    }, new Map<EntityId, Path<PathType, NodeType>[]>());

    return new Cache<NodeType, PathType>(state);
  }

  increment<NodeType, PathType>(currentState: Map<EntityId, Path<PathType, NodeType>[]>, changes: GraphAction<NodeType | PathType>[]) {
    const newState = deepCloneMap(currentState);

    changes.forEach((change) => {
      const newEntity = change.head;
      const currentEntity = change.base;

      const isNode = (newEntity?.type ?? currentEntity?.type) === EntityType.Node;
      const isPath = (newEntity?.type ?? currentEntity?.type) === EntityType.Path;

      if (isNode) {
        this.applyNodeChange(newState, change);
      }
      if (isPath) {
        this.applyPathChange(newState, change as GraphAction<Path<PathType, NodeType>>);
      }
    });

    return new Cache<NodeType, PathType>(newState);
  }

  private applyNodeChange<NodeType, PathType>(state: Map<EntityId, Path<PathType, NodeType>[]>, change: GraphAction<NodeType>) {
    const newEntity = change.head;
    const currentEntity = change.base;

    switch (change.type) {
      case ActionType.Added:
        if (!newEntity) {
          throw new Error('No head available');
        }
        state.set(newEntity.id, []);
        break;

      case ActionType.Replaced:
        if (!currentEntity || !newEntity) {
          throw new Error('No base or head available');
        }
        break;
      case ActionType.Removed:
        if (!currentEntity) {
          throw new Error('No base available');
        }
        state.delete(currentEntity.id);
        break;
      default:
    }
  }

  private applyPathChange<NodeType, PathType>(state: Map<EntityId, Path<PathType, NodeType>[]>, change: GraphAction<Path<PathType, NodeType>>) {
    const newPath = change.head;
    const currentPath = change.base;

    switch (change.type) {
      case ActionType.Added:
        if (!newPath) {
          throw new Error('No head available');
        }
        // need to iterate to all nodes in path
        const uniqueNodes = this.getUniqueNodes(newPath);
        uniqueNodes.forEach((node) => {
          const nodePaths = state.get(node.id);
          nodePaths?.push(newPath);
        });
        break;

      case ActionType.Replaced:
        if (!currentPath || !newPath) {
          throw new Error('No base or head available');
        }
        state.forEach((paths, entityId) => {
          const isPathRelated = newPath.nodes.some((n) => n.id === entityId);
          const foundPathIndex = paths.findIndex((p) => p.id === newPath.id);
          if (foundPathIndex > -1) {
            paths.splice(foundPathIndex, 1, newPath);
          } else if (isPathRelated) {
            paths.push(newPath);
          }
        });
        break;

      case ActionType.Removed:
        if (!currentPath) {
          throw new Error('No base available');
        }

        state.forEach((paths) => {
          const foundPathIndex = paths.findIndex((p) => p.id === currentPath.id);
          if (foundPathIndex > -1) {
            paths.splice(foundPathIndex, 1);
          }
        });

        break;
      default:
    }
  }

  private getUniqueNodes<NodeType, PathType>(path: Path<PathType, NodeType>) {
    const uniqueNodes = path.nodes.filter((value, index, self) => {
      return self.findIndex((x) => x.id === value.id) === index;
    });
    return uniqueNodes;
  }
}
