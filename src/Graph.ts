import Entity from './Entity';
import EntityId from "./EntityId";
import EntityType from './EntityType';
import Node from './Node';
import Path from './Path';
import GraphUpdater from './update/GraphUpdater';

export default class Graph<T> {
    private _entities: Map<EntityId, Entity<T>>;
    private _cachedPaths: Map<EntityId, Path<T>[]>;

    constructor(entities: Entity<T>[]) {
        this._entities = entities.reduce((map, entity) => {
            map.set(entity.id, entity);
            return map;
        }, new Map<EntityId, Entity<T>>());
        this._cachedPaths = this.rebuildCache();
    }

    static initialize<T>(entityMap: Map<EntityId, Entity<T>>, cachedPaths: Map<EntityId, Path<T>[]>) : Graph<T>{
        const graph = new Graph<T>([]);
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
                const path = <Path<T>>entity;
                path.nodes.forEach(node => {
                    const paths = map.get(node.id) || [];
                    paths.push(path);
                    map.set(node.id, paths);
                });
            }
            return map;
        }, new Map<EntityId, Path<T>[]>());

        return cache;
    }

    getEntityUnsafe(id: EntityId): Entity<T> | undefined {
        return this._entities.get(id);
    }


    getEntity(id: EntityId): Entity<T> {
        const Entity: Entity<T> | undefined = this.getEntityUnsafe(id);
        if (Entity === undefined) {
            throw new RangeError('id not found in graph: ' + id);
        } else {
            return Entity;
        }
    }

    getEntityAs<J extends Entity<T>>(id: EntityId, type: EntityType) {
        const Entity: Entity<T> = this.getEntity(id);
        if (Entity.type === type) {
            return <J>Entity;
        } else {
            throw new TypeError(`Entity of wrong type got ${Entity.type} expected ${type}`);
        }
    }

    getNode(id: EntityId): Node<T> {
        return this.getEntityAs(id, EntityType.Node);
    }

    getPath(id: EntityId): Path<T> {
        return this.getEntityAs(id, EntityType.Path);
    }

    entities() {
        return this._entities.values();
    }

    entityIds() {
        return this._entities.keys();
    }

    getEntityPaths(id: EntityId): Path<T>[] {
        return this._cachedPaths.get(id) || []
    }

    beginUpdate() {
        return new GraphUpdater<T>(this);
    }
}

