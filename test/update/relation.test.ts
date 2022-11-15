import EntityType from '../../src/EntityType';
import Graph from '../../src/Graph';

describe('Perigra Relations', () => {
  it('Should add relation', () => {
    const pos1: [number, number] = [0, 0];
    const node1 = { id: 'node-1', type: EntityType.Node, tags: {}, position: pos1 };
    const node2 = { id: 'node-2', type: EntityType.Node, tags: {}, position: pos1 };

    const relation = { id: 'relation-1', type: EntityType.Relation, tags: {}, relationType: 'test', members: [node1, node2] };

    let graph = new Graph<{}, {}>([]);
    const updater = graph.beginUpdate();

    updater.addNode(node1);
    updater.addNode(node2);
    updater.addRelation(relation);

    graph = updater.commit();

    expect(graph.getEntity('relation-1')).toBeTruthy();
  });

  it('Should replace relation', () => {
    const pos1: [number, number] = [0, 0];
    const node1 = { id: 'node-1', type: EntityType.Node, tags: {}, position: pos1 };
    const node2 = { id: 'node-2', type: EntityType.Node, tags: {}, position: pos1 };
    const node3 = { id: 'node-3', type: EntityType.Node, tags: {}, position: pos1 };

    const relation = { id: 'relation-1', type: EntityType.Relation, tags: {}, relationType: 'test', members: [node1, node2] };
    const newRelation = { id: 'relation-1', type: EntityType.Relation, tags: {}, relationType: 'test', members: [node1, node3] };

    let graph = new Graph<{}, {}>([]);

    let updater = graph.beginUpdate();
    updater.addNode(node1);
    updater.addNode(node2);
    updater.addNode(node3);
    updater.addRelation(relation);
    graph = updater.commit();

    updater = graph.beginUpdate();
    updater.replaceEntity(newRelation);
    graph = updater.commit();

    expect(graph.getEntity('relation-1')).toStrictEqual(newRelation);
  });

  it('Should remove relation', (done) => {
    const pos1: [number, number] = [0, 0];
    const node1 = { id: 'node-1', type: EntityType.Node, tags: {}, position: pos1 };
    const node2 = { id: 'node-2', type: EntityType.Node, tags: {}, position: pos1 };
    const node3 = { id: 'node-3', type: EntityType.Node, tags: {}, position: pos1 };

    const relation = { id: 'relation-1', type: EntityType.Relation, tags: {}, relationType: 'test', members: [node1, node2] };

    let graph = new Graph<{}, {}>([]);

    let updater = graph.beginUpdate();
    updater.addNode(node1);
    updater.addNode(node2);
    updater.addNode(node3);
    updater.addRelation(relation);
    graph = updater.commit();

    updater = graph.beginUpdate();
    updater.removeEntity('relation-1');
    graph = updater.commit();

    try {
      expect(graph.getEntity('relation-1')).toThrow();
    } catch (e) {
      done();
    }
  });

  it('Should update relation cache path when add', () => {
    const pos1: [number, number] = [0, 0];
    const node1 = { id: 'node-1', type: EntityType.Node, tags: {}, position: pos1 };
    const node2 = { id: 'node-2', type: EntityType.Node, tags: {}, position: pos1 };
    const node3 = { id: 'node-3', type: EntityType.Node, tags: {}, position: pos1 };

    const relation = { id: 'relation-1', type: EntityType.Relation, tags: {}, relationType: 'test', members: [node1, node2] };

    let graph = new Graph<{}, {}>([]);

    const updater = graph.beginUpdate();
    updater.addNode(node1);
    updater.addNode(node2);
    updater.addNode(node3);
    updater.addRelation(relation);
    graph = updater.commit();

    expect(graph.getEntityRelations('node-1')[0].id).toBe('relation-1');
  });

  it('Should update relation cache path when replace', () => {
    const pos1: [number, number] = [0, 0];
    const node1 = { id: 'node-1', type: EntityType.Node, tags: {}, position: pos1 };
    const node2 = { id: 'node-2', type: EntityType.Node, tags: {}, position: pos1 };
    const node3 = { id: 'node-3', type: EntityType.Node, tags: {}, position: pos1 };

    const relation = { id: 'relation-1', type: EntityType.Relation, tags: {}, relationType: 'test', members: [node1, node2] };
    const newRelation = { id: 'relation-1', type: EntityType.Relation, tags: {}, relationType: 'test', members: [node1, node3] };

    let graph = new Graph<{}, {}>([]);

    let updater = graph.beginUpdate();
    updater.addNode(node1);
    updater.addNode(node2);
    updater.addNode(node3);
    updater.addRelation(relation);
    graph = updater.commit();

    updater = graph.beginUpdate();
    updater.replaceEntity(newRelation);
    graph = updater.commit();

    expect(graph.getEntityRelations('node-1')[0].id).toBe('relation-1');
    expect(graph.getEntityRelations('node-2').length).toBe(0);
    expect(graph.getEntityRelations('node-3')[0].id).toBe('relation-1');
  });

  it('Should update relation cache path when removed', () => {
    const pos1: [number, number] = [0, 0];
    const node1 = { id: 'node-1', type: EntityType.Node, tags: {}, position: pos1 };
    const node2 = { id: 'node-2', type: EntityType.Node, tags: {}, position: pos1 };
    const node3 = { id: 'node-3', type: EntityType.Node, tags: {}, position: pos1 };

    const relation = { id: 'relation-1', type: EntityType.Relation, tags: {}, relationType: 'test', members: [node1, node2] };

    let graph = new Graph<{}, {}>([]);

    let updater = graph.beginUpdate();
    updater.addNode(node1);
    updater.addNode(node2);
    updater.addNode(node3);
    updater.addRelation(relation);
    graph = updater.commit();

    updater = graph.beginUpdate();
    updater.removeEntity('relation-1');
    graph = updater.commit();

    expect(graph.getEntityRelations('node-2').length).toBe(0);
  });
});
