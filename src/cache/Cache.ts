import EntityId from '../EntityId';
import Path from '../Path';
import GraphAction from '../update/GraphAction';
import CacheBuilder from './CacheBuilder';

export default class Cache<NodeType, PathType> {
  private _cachedPaths: Map<EntityId, Path<PathType, NodeType>[]>;

  constructor(state: Map<EntityId, Path<PathType, NodeType>[]>) {
    this._cachedPaths = state;
  }

  clone(): Cache<NodeType, PathType> {
    const cache = new Cache<NodeType, PathType>(new Map(this._cachedPaths));
    return cache;
  }

  increment(changes: GraphAction<NodeType | PathType>[]): Cache<NodeType, PathType> {
    return new CacheBuilder().increment<NodeType, PathType>(this._cachedPaths, changes);
  }
  getEntityPaths(id: EntityId): Path<PathType, NodeType>[] {
    return this._cachedPaths.get(id) || [];
  }
}
