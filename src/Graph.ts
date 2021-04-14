import Cache from './cache/Cache';
import CacheBuilder from './cache/CacheBuilder';
import Entity from './Entity';
import EntityId from "./EntityId";
import EntityType from './EntityType';
import Node from './Node';
import Path from './Path';
import GraphUpdater from './update/GraphUpdater';

export default class Graph<NodeType, PathType> {
    private _entities: Map<EntityId, Entity<NodeType | PathType>>;
    private _cache: Cache<NodeType, PathType>;

    constructor(entities: Entity<NodeType | PathType>[]) {
        this._entities = entities.reduce((map, entity) => {
            map.set(entity.id, entity);
            return map;
        }, new Map<EntityId, Entity<NodeType | PathType>>());
        this._cache = new CacheBuilder().buildCache<NodeType, PathType>(this._entities, Array.from(this.entityIds()));
    }


    static initialize<NodeType, PathType>(entityMap: Map<EntityId, Entity<NodeType | PathType>>, cache: Cache<NodeType, PathType>): Graph<NodeType, PathType> {
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
            entities: new Map(this._entities),
            cache: this._cache.clone()
        }
    }



    getEntityUnsafe(id: EntityId): Entity<NodeType | PathType> | undefined {
        return this._entities.get(id);
    }


    getEntity(id: EntityId): Entity<NodeType | PathType> {
        const Entity: Entity<NodeType | PathType> | undefined = this.getEntityUnsafe(id);
        if (Entity === undefined) {
            throw new RangeError('id not found in graph: ' + id);
        } else {
            return Entity;
        }
    }

    getEntityAs<J extends Entity<NodeType | PathType>>(id: EntityId, type: EntityType) {
        const Entity: Entity<NodeType | PathType> = this.getEntity(id);
        if (Entity.type === type) {
            return <J>Entity;
        } else {
            throw new TypeError(`Entity of wrong type got ${Entity.type} expected ${type}`);
        }
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
        return this._cache.getEntityPaths(id) || []
    }

    beginUpdate() {
        return new GraphUpdater<NodeType, PathType>(this);
    }
}

