import Entity from "../Entity";
import EntityId from "../EntityId";
import EntityType from "../EntityType";
import Path from "../Path";
import GraphAction, { ActionType } from "../update/GraphAction";
import Cache from "./Cache";

export default class CacheBuilder {
    buildCache<NodeType, PathType>(entities: Map<EntityId, Entity<NodeType | PathType>>, ids: EntityId[]) {
        let idArray = ids;

        const state = idArray.reduce((map, id) => {
            const entity = entities.get(id);
            if (entity && entity.type == EntityType.Path) {
                const path = <Path<PathType, NodeType>>entity;
                path.nodes.forEach(node => {
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
        const removedIds: EntityId[] = [];
        const refreshIds: EntityId[] = [];
        changes.forEach(change => {
            switch (change.type) {
                case ActionType.Added:
                    if (!change.head) {
                        throw new Error('No head available');
                    }
                    refreshIds.push(change.head.id);
                    break;
                case ActionType.Removed:
                    if (!change.base) {
                        throw new Error('No base available');
                    }
                    removedIds.push(change.base.id);
                    break;
                case ActionType.Replaced:
                    if (!change.base || !change.head) {
                        throw new Error('No base or head available' + change);
                    }
                    if (change.base.type === EntityType.Node) {

                    }
                    break;
            }
        });
        return new Cache<NodeType, PathType>(new Map(currentState));
    }
}