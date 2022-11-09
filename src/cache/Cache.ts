import EntityId from '../EntityId';
import deepCloneMap from '../helper/deepCloneMap';
import Path from '../Path';
import Relation from '../Relation';
import GraphAction from '../update/GraphAction';
import CacheBuilder from './CacheBuilder';

export default class Cache<NodeType, PathType> {
  private _cachedPaths: Map<EntityId, Path<PathType, NodeType>[]>;
  private _cachedRelations: Map<EntityId, Relation<PathType, NodeType>[]>;

  constructor(state: Map<EntityId, Path<PathType, NodeType>[]>, relations: Map<EntityId, Relation<PathType, NodeType>[]>) {
    this._cachedPaths = state;
    this._cachedRelations = relations;
  }

  clone(): Cache<NodeType, PathType> {
    const cache = new Cache<NodeType, PathType>(deepCloneMap(this._cachedPaths), deepCloneMap(this._cachedRelations));
    return cache;
  }

  increment(changes: GraphAction<NodeType | PathType | Relation<PathType, NodeType>>[]): Cache<NodeType, PathType> {
    return new CacheBuilder().increment<NodeType, PathType>(this._cachedPaths, this._cachedRelations, changes);
  }

  getEntityPaths(id: EntityId): Path<PathType, NodeType>[] {
    return this._cachedPaths.get(id) || [];
  }

  getEntityRelations(id: EntityId): Relation<PathType, NodeType>[] {
    return this._cachedRelations.get(id) || [];
  }
}
