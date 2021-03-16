import Entity from '../Entity';
import EntityId from '../EntityId';
import EntityType from '../EntityType';
import Graph from '../Graph';

import EntityUpdater from './EntityUpdater';

export type GraphAction<T> = (entities: Map<EntityId, Entity<T>>) => Map<EntityId, Entity<T>>;

export default class GraphUpdater<T> {
    private actions: GraphAction<T>[] = [];
    private graph: Graph<T>;
    constructor(graph: Graph<T> = new Graph([])) {
        this.graph = graph;
    }

    queue(action: GraphAction<T>): GraphUpdater<T> {
        this.actions.push(action);
        return this;
    }

    addEntity(_entity: Entity<T>) {
        return this.queue(entityMap => entityMap.set(_entity.id, _entity));
    }

    removeEntity(id: EntityId) {
        return this.queue(entityMap => { entityMap.delete(id); return entityMap; });
    }

    replaceEntity(_entity: Entity<T>) {
        return this.queue(entityMap => entityMap.set(_entity.id, _entity));
    }
    // add path -> set
    // change nodes in path -> replace path
    // remove path -> set undefined?
    // add node
    // add node and add to path -> set, replace

    // node(id: EntityId) {
    //     return NodeUpdater(this, this.graph.getNode(id));
    // }
    // addNode().link(12).insertAt(12, e).end().commit();
    // node(12).tags().add('123','123').end().end().commit();//(12).insertAt(12, e).end().commit();
    // node(12).position()

    node(nodeId: EntityId) {
        return new EntityUpdater<T>(this, this.graph.getEntityAs(nodeId, EntityType.Node));
    }
    commit() {
        return this.update();
    }

    private update(..._actions: GraphAction<T>[]): Graph<T> {
        const state = this.graph._cloneState();
        this.actions.forEach(a => a(state.entities));

        // TODO, compact graph, multiple subsequent replaces would remove later ones?
        // TODO, actions should change the graph state
        // TODO, efficently recalculate cachedPaths depending on the changes / actions
        return Graph.initialize<T>(state.entities, state.cachedPaths);
    }

}
