import Cache from './cache/Cache';
import CacheBuilder from './cache/CacheBuilder';
import Entity from './Entity';
import EntityId from './EntityId';
import EntityType from './EntityType';
import Node from './Node';
import Path from './Path';
import Relation from './Relation';
import GraphUpdater from './update/GraphUpdater';

export default class Graph<NodeType, PathType> {
  private _entities: Map<EntityId, Entity<NodeType | PathType | Relation<PathType, NodeType>>>;
  private _cache: Cache<NodeType, PathType>;

  constructor(entities: Entity<NodeType | PathType>[]) {
    this._entities = entities.reduce((map, entity) => {
      map.set(entity.id, entity);
      return map;
    }, new Map<EntityId, Entity<NodeType | PathType>>());
    this._cache = new CacheBuilder().buildCache<NodeType, PathType>(this._entities, Array.from(this.entityIds()));
  }

  static initialize<NodeType, PathType>(
    entityMap: Map<EntityId, Entity<NodeType | PathType | Relation<PathType, NodeType>>>,
    cache: Cache<NodeType, PathType>
  ): Graph<NodeType, PathType> {
    const graph = new Graph<NodeType, PathType>([]);
    graph._entities = entityMap;
    graph._cache = cache;

    return graph;
  }

  /**
   * Not expected to be used under normal usage of this class
   */
  _cloneState() {
    return {
      // TODO: not deep copy on object
      entities: new Map(this._entities),
      cache: this._cache.clone()
    };
  }

  getEntityUnsafe(id: EntityId): Entity<NodeType | PathType | Relation<PathType, NodeType>> | undefined {
    return this._entities.get(id);
  }

  getEntity(id: EntityId): Entity<NodeType | PathType | Relation<PathType, NodeType>> {
    const entity: Entity<NodeType | PathType | Relation<PathType, NodeType>> | undefined = this.getEntityUnsafe(id);
    if (entity === undefined) {
      throw new RangeError(`id not found in graph: ${id}`);
    } else {
      return entity;
    }
  }

  getEntityAs<J extends Entity<NodeType | PathType | Relation<PathType, NodeType>>>(id: EntityId, type: EntityType) {
    const entity: Entity<NodeType | PathType | Relation<PathType, NodeType>> = this.getEntity(id);
    if (entity.type === type) {
      return entity as J;
    }
    throw new TypeError(`Entity of wrong type got ${entity.type} expected ${type}`);
  }

  getNode(id: EntityId): Node<NodeType> {
    return this.getEntityAs(id, EntityType.Node);
  }

  getPath(id: EntityId): Path<PathType, NodeType> {
    return this.getEntityAs(id, EntityType.Path);
  }

  entities() {
    return this._entities.values();
  }

  entityIds() {
    return this._entities.keys();
  }

  getEntityPaths(id: EntityId): Path<PathType, NodeType>[] {
    return this._cache.getEntityPaths(id) || [];
  }

  beginUpdate() {
    return new GraphUpdater<NodeType, PathType>(this);
  }

  getRelation(id: EntityId): Relation<PathType, NodeType> {
    return this.getEntityAs(id, EntityType.Relation);
  }

  getEntityRelations(id: EntityId): Relation<PathType, NodeType>[] {
    return this._cache.getEntityRelations(id) || [];
  }
}
