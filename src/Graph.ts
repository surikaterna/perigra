import Entity from './Entity';
import EntityId from "./EntityId";
import EntityType from './EntityType';
import Node from './Node';
import Path from './Path';


export default class Graph {
    private _entities: Map<EntityId, Entity>;
    private _cachedPaths: Map<EntityId, Path[]>;

    constructor(entities: Entity[]) {
        this._entities = entities.reduce((map, entity) => {
            map.set(entity.id, entity);
            return map;
        }, new Map<EntityId, Entity>());
        this._cachedPaths = this.rebuildCache();
    }

    static initialize(entityMap: Map<EntityId, Entity>, cachedPaths: Map<EntityId, Path[]>) {
        const graph = new Graph([]);
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
                const path = <Path>entity;
                path.nodes.forEach(node => {
                    const paths = map.get(node.id) || [];
                    paths.push(path);
                    map.set(node.id, paths);
                });
            }
            return map;
        }, new Map<EntityId, Path[]>());

        return cache;
    }

    getEntity(id: EntityId): Entity {
        const Entity: Entity | undefined = this._entities.get(id);
        if (Entity === undefined) {
            throw new RangeError('id not found in graph: ' + id);
        } else {
            return Entity;
        }
    }

    getEntityAs<T extends Entity>(id: EntityId, type: EntityType) {
        const Entity: Entity = this.getEntity(id);
        if (Entity.type === type) {
            return <T>Entity;
        } else {
            throw new TypeError(`Entity of wrong type got ${Entity.type} expected ${type}`);
        }
    }

    getNode(id: EntityId): Node {
        return this.getEntityAs(id, EntityType.Node);
    }

    getPath(id: EntityId): Path {
        return this.getEntityAs(id, EntityType.Path);
    }

    entities() {
        return this._entities.values();
    }

    entityIds() {
        return this._entities.keys();
    }

    getEntityPaths(id: EntityId): Path[] {
        return this._cachedPaths.get(id) || []
    }
}

