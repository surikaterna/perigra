import Entity from '../Entity';
import EntityId from '../EntityId';
import EntityType from '../EntityType';
import Graph from '../Graph';
import Node from '../Node';
import GraphUpgrader from '../merger/GraphMerger';

import GraphAction, { ActionType } from './GraphAction';
import ObjectUpdater from './ObjectUpdater';
import createObjectUpdater from './proxies/createObjectUpdater';

export default class GraphUpdater<NodeType = {}, PathType = {}> {
  private actions: GraphAction<NodeType | PathType>[] = [];
  private graph: Graph<NodeType, PathType>;
  constructor(graph: Graph<NodeType, PathType> = new Graph([])) {
    this.graph = graph;
  }

  queue(action: GraphAction<NodeType | PathType>): GraphUpdater<NodeType, PathType> {
    this.actions.push(action);
    return this;
  }

  addEntity(entity: Entity<NodeType | PathType>) {
    this.queue({ type: ActionType.Added, head: entity });
    return this.entityUpdater(entity);
  }

  removeEntity(id: EntityId) {
    return this.queue({ type: ActionType.Removed, base: this.graph.getEntityUnsafe(id) || this.resolveEntityFromChanges(id) });
  }

  replaceEntity(_entity: Entity<NodeType | PathType>) {
    return this.queue({ type: ActionType.Replaced, base: this.graph.getEntity(_entity.id), head: _entity });
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

  addNode(node: Node<NodeType>): ObjectUpdater<Node<NodeType>, GraphUpdater<NodeType, PathType>> {
    this.addEntity(node);
    return this.entityUpdater(node);
  }

  private resolveEntityFromChanges(id: EntityId) {
    for (let i = this.actions.length; i > 0; i--) {
      const action = this.actions[i - 1];
      if (action.type === ActionType.Added && action.head && action.head.id === id) {
        return action.head;
      }
    }
    throw new Error('Unable to find entity for id: ' + id);
  }

  private entityUpdater<T extends Entity<NodeType | PathType>>(node: T): ObjectUpdater<T, GraphUpdater<NodeType, PathType>> {
    return createObjectUpdater<T, GraphUpdater<NodeType, PathType>>(node, (entity) => {
      this.replaceEntity(entity);
      return this;
    });
  }
  node(nodeId: EntityId) {
    const node = this.graph.getEntityAs<Node<NodeType>>(nodeId, EntityType.Node);
    return this.entityUpdater(node);
  }

  commit() {
    return this.upgrade(this.actions);
  }

  private upgrade(_actions: GraphAction<NodeType | PathType>[]): Graph<NodeType, PathType> {
    // const state = this.graph._cloneState();
    // this.actions.forEach(a => a(state.entities));

    // TODO, compact graph, multiple subsequent replaces would remove later ones?
    // TODO, actions should change the graph state
    // TODO, efficently recalculate cachedPaths depending on the changes / actions
    // return Graph.initialize<NodeType>(state.entities, state.cachedPaths);
    return new GraphUpgrader(this.graph).increment(_actions);
  }
}
