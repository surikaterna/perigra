import Entity, {EntityBaseState } from '../Entity';
import EntityId from '../EntityId';
import EntityType from '../EntityType';
import Graph from '../Graph';
import Node from '../Node';

import EntityUpdater from './EntityUpdater';

export type GraphAction<T> = (entities: Map<EntityId, Entity<T>>) => Map<EntityId, Entity<T>>;

export default class GraphUpdater<NodeType = {}, PathType={}> {
    
    private actions: GraphAction<EntityBaseState>[] = [];
    private graph: Graph<NodeType | PathType>;
    constructor(graph: Graph<NodeType | PathType> = new Graph([])) {
        this.graph = graph;
    }

    queue(action: GraphAction<NodeType | PathType>): GraphUpdater<NodeType, PathType, BaseTypeT> {
        this.actions.push(action);
        return this;
    }

    addEntity(entity: Entity<NodeType | PathType>) {
        this.queue(entityMap => entityMap.set(entity.id, entity));
        return this.node(entity.id);
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

    addNode(node: Node<NodeType>) {
        return this.addEntity(node);
    }

    node(nodeId: EntityId) {
        return new EntityUpdater<NodeType>(this, this.graph.getEntityAs(nodeId, EntityType.Node));
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
