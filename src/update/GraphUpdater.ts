import Entity from '../Entity';
import EntityId from '../EntityId';
import Graph from '../Graph';

export type GraphAction = (Entitys: Map<EntityId, Entity>) => Map<EntityId, Entity>;

export default class GraphUpdater {
    private actions: GraphAction[] = [];
    private graph: Graph;
    constructor(graph: Graph = new Graph([])) {
        this.graph = graph;
    }

    queue(action: GraphAction): GraphUpdater {
        this.actions.push(action);
        return this;
    }

    addEntity(_entity: Entity) {
        return this.queue(entityMap => entityMap.set(_entity.id, _entity));
    }

    removeEntity(id: EntityId) {
        return this.queue(entityMap => { entityMap.delete(id); return entityMap; });
    }

    replaceEntity(_entity: Entity) {
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


    commit() {
        return this.update();
    }

    private update(..._actions: GraphAction[]): Graph {
        const state = this.graph._cloneState();
        this.actions.forEach(a => a(state.entities));

        // TODO, actions should change the graph state
        // TODO, efficently recalculate cachedPaths depending on the changes / actions
        return Graph.initialize(state.entities, state.cachedPaths);
    }

}
