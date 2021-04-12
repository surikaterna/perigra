import Entity from './Entity';
import EntityId from "./EntityId";
import EntityType from './EntityType';
import Node from './Node';
import Path from './Path';
import GraphUpdater from './update/GraphUpdater';

export default class Graph<NodeType, PathType> {
    private _entities: Map<EntityId, Entity<NodeType | PathType>>;
    private _cachedPaths: Map<EntityId, Path<PathType>[]>;

    constructor(entities: Entity<NodeType | PathType>[]) {
        this._entities = entities.reduce((map, entity) => {
            map.set(entity.id, entity);
            return map;
        }, new Map<EntityId, Entity<NodeType | PathType>>());
        this._cachedPaths = this.rebuildCache();
    }

    static initialize<NodeType, PathType>(entityMap: Map<EntityId, Entity<NodeType | PathType>>, cachedPaths: Map<EntityId, Path<PathType>[]>): Graph<NodeType, PathType> {
        const graph = new Graph<NodeType, PathType>([]);
        graph._entities = entityMap;
        graph._cachedPaths = cachedPaths;

        return graph;
    }

    /**
     * Not expected to be used under normal usage of this class
     */
    _cloneState() {
        return {
            entities: new Map(this._entities),
            cachedPaths: new Map(this._cachedPaths)
        }
    }

    private rebuildCache(ids?: EntityId[]) {
        let idArray = ids;
        if (idArray === undefined) {
            idArray = Array.from(this.entityIds());
        }

        const cache = idArray.reduce((map, id) => {
            const entity = this.getEntity(id);
            if (entity.type == EntityType.Path) {
                const path = <Path<PathType>>entity;
                path.nodes.forEach(node => {
                    const paths = map.get(node.id) || [];
                    paths.push(path);
                    map.set(node.id, paths);
                });
            }
            return map;
        }, new Map<EntityId, Path<PathType>[]>());

        return cache;
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

    getPath(id: EntityId): Path<PathType> {
        return this.getEntityAs(id, EntityType.Path);
    }

    entities() {
        return this._entities.values();
    }

    entityIds() {
        return this._entities.keys();
    }

    getEntityPaths(id: EntityId): Path<PathType>[] {
        return this._cachedPaths.get(id) || []
    }

    beginUpdate() {
        return new GraphUpdater<NodeType, PathType>(this);
    }
}

