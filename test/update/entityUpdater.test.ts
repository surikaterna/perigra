import EntityType from '../../src/EntityType';
import Graph from '../../src/Graph';
import createObjectUpdater from '../../src/update/proxies/createObjectUpdater';

type MyEntity = {
  position: [number, number];
  id: string;
  tags: Record<string, string>;
  body: { nose: string; arm: boolean; hand: { fingers: number } };
};

const deepFreeze = <T extends Record<string, any>>(obj: T) => {
  Object.keys(obj).forEach((prop) => {
    if (typeof obj[prop] === 'object') deepFreeze(obj[prop]);
  });
  return <T>Object.freeze(obj);
};

const myEntityTemplate: MyEntity = deepFreeze({
  position: [1, 1],
  id: 'abc',
  tags: { hello: 'world' },
  body: { nose: 'yes', arm: false, hand: { fingers: 10 } }
});

describe('entityUpdater', () => {
  it('change property of node', (async) => {
    const upg = createObjectUpdater(myEntityTemplate, (res) => {
      expect(res.position).toEqual([12, 23]);
      expect(myEntityTemplate.position).toEqual([1, 1]);
      async();
      return {};
    });

    upg.updatePosition([12, 23]).end();
  });

  it('change sub object of node', (async) => {
    const upg = createObjectUpdater(myEntityTemplate, (res) => {
      expect(res.body.arm).toEqual(true);
      expect(myEntityTemplate.body.arm).toEqual(false);
      async();
      return {};
    });

    upg.bodyAsObject().updateArm(true).end().end();
  });

  it('change sub record of node', (async) => {
    const upg = createObjectUpdater(myEntityTemplate, (res) => {
      expect(res.tags.as).toEqual('123123');
      expect(myEntityTemplate.tags.as).toBeUndefined();
      async();
    });

    upg.tagsAsRecord().replace('as', '123123').end().end();
  });

  it('multiple replace entities should update path correct', (done) => {
    const pos1: [number, number] = [0, 0];
    const pos2: [number, number] = [0, 1];
    const pos3: [number, number] = [0, 2];

    const pos1new: [number, number] = [1, 0];
    const pos2new: [number, number] = [1, 1];
    const pos3new: [number, number] = [1, 2];

    const node1 = { id: 'node-1', type: EntityType.Node, tags: {}, position: pos1 };
    const node2 = { id: 'node-2', type: EntityType.Node, tags: {}, position: pos2 };
    const node3 = { id: 'node-3', type: EntityType.Node, tags: {}, position: pos3 };

    const path1 = { id: 'path-1', type: EntityType.Path, tags: {}, nodes: [node1, node2, node3, node1] };

    let graph = new Graph<typeof node1, typeof path1>([]);
    let updater = graph.beginUpdate();

    updater.addNode(node1);
    updater.addNode(node2);
    updater.addNode(node3);
    updater.addPath(path1);
    graph = updater.commit();

    updater = graph.beginUpdate();
    updater.replaceEntity({ ...node1, position: pos1new });
    updater.replaceEntity({ ...node2, position: pos2new });
    updater.replaceEntity({ ...node3, position: pos3new });

    graph = updater.commit();

    const result = graph.getEntityPaths('node-1')[0].nodes.find((n) => n.id === 'node-1');
    expect(result?.position).toEqual([1, 0]);
    done();
  });

  it('should add to entityPaths when existing path get replaced but not existed yet in a new node (add new node to existing path case)', (done) => {
    const pos1: [number, number] = [0, 0];
    const pos2: [number, number] = [0, 1];
    const pos3: [number, number] = [0, 2];

    const node1 = { id: 'node-1', type: EntityType.Node, tags: {}, position: pos1 };
    const node2 = { id: 'node-2', type: EntityType.Node, tags: {}, position: pos2 };
    const node3 = { id: 'node-3', type: EntityType.Node, tags: {}, position: pos3 };

    const path1 = { id: 'path-1', type: EntityType.Path, tags: {}, nodes: [node1, node2, node1] };
    const path1updated = { id: 'path-1', type: EntityType.Path, tags: {}, nodes: [node1, node2, node3, node1] };

    let graph = new Graph<typeof node1, typeof path1>([]);
    let updater = graph.beginUpdate();

    updater.addNode(node1);
    updater.addNode(node2);
    updater.addPath(path1);
    graph = updater.commit();

    updater = graph.beginUpdate();
    updater.addNode(node3);
    updater.replaceEntity(path1updated);

    graph = updater.commit();

    expect(graph.getEntityPaths('node-3').length).toEqual(1);

    done();
  });

  it('should correctly join node', (done) => {
    const pos1: [number, number] = [0, 0];
    const pos2: [number, number] = [0, 1];
    const pos3: [number, number] = [0, 2];
    const pos4: [number, number] = [0, 3];

    const node1 = { id: 'node-1', type: EntityType.Node, tags: {}, position: pos1 };
    const node2 = { id: 'node-2', type: EntityType.Node, tags: {}, position: pos2 };
    const node3 = { id: 'node-3', type: EntityType.Node, tags: {}, position: pos3 };
    const node4 = { id: 'node-4', type: EntityType.Node, tags: {}, position: pos4 };

    const path1 = { id: 'path-1', type: EntityType.Path, tags: {}, nodes: [node1, node2, node1] };
    const path2 = { id: 'path-2', type: EntityType.Path, tags: {}, nodes: [node3, node4] };

    const path2updated = { id: 'path-2', type: EntityType.Path, tags: {}, nodes: [node1, node4] };

    // first state
    let graph = new Graph<typeof node1, typeof path1>([]);
    let updater = graph.beginUpdate();

    updater.addNode(node1);
    updater.addNode(node2);
    updater.addNode(node3);
    updater.addNode(node4);
    updater.addPath(path1);
    updater.addPath(path2);
    graph = updater.commit();

    // second
    updater = graph.beginUpdate();

    updater.removeEntity('node-3');
    updater.replaceEntity(path2updated);

    graph = updater.commit();

    expect(graph.getEntityPaths('node-1')[0].id).toBe('path-1');
    expect(graph.getEntityPaths('node-1')[1].id).toBe('path-2');

    expect(graph.getEntityPaths('node-1')[0].nodes.map((n) => n.id)).toEqual(['node-1', 'node-2', 'node-1']);
    expect(graph.getEntityPaths('node-1')[1].nodes.map((n) => n.id)).toEqual(['node-1', 'node-4']);

    done();
  });

  it('should correctly unjoin node', (done) => {
    const pos1: [number, number] = [0, 0];
    const pos2: [number, number] = [0, 1];
    const pos3: [number, number] = [0, 2];
    const pos4: [number, number] = [0, 3];
    const pos5: [number, number] = [0, 4];
    const pos6: [number, number] = [0, 5];

    const node1 = { id: 'node-1', type: EntityType.Node, tags: {}, position: pos1 };
    const node2 = { id: 'node-2', type: EntityType.Node, tags: {}, position: pos2 };
    const node3 = { id: 'node-3', type: EntityType.Node, tags: {}, position: pos3 };
    const node4 = { id: 'node-4', type: EntityType.Node, tags: {}, position: pos4 };
    const node5 = { id: 'node-5', type: EntityType.Node, tags: {}, position: pos5 };
    const node6 = { id: 'node-6', type: EntityType.Node, tags: {}, position: pos6 };

    const path1 = { id: 'path-1', type: EntityType.Path, tags: {}, nodes: [node1, node2, node1] };
    const path2 = { id: 'path-2', type: EntityType.Path, tags: {}, nodes: [node1, node3, node4] };

    const path1updated = { id: 'path-1', type: EntityType.Path, tags: {}, nodes: [node5, node2, node5] };
    const path2updated = { id: 'path-2', type: EntityType.Path, tags: {}, nodes: [node6, node3, node4] };

    let graph = new Graph<typeof node1, typeof path1>([]);
    let updater = graph.beginUpdate();

    updater.addNode(node1);
    updater.addNode(node2);
    updater.addNode(node3);
    updater.addNode(node4);
    updater.addPath(path1);
    updater.addPath(path2);
    graph = updater.commit();

    updater = graph.beginUpdate();
    updater.removeEntity(node1.id);
    updater.addNode(node5);
    updater.replaceEntity(path1updated);
    updater.addNode(node6);
    updater.replaceEntity(path2updated);

    graph = updater.commit();

    const pathsOfNode2 = graph.getEntityPaths('node-2');
    expect(pathsOfNode2.some((p) => p.id === 'path-1')).toBeTruthy();

    done();
  });

  it('should correctly delete path and its node', (done) => {
    const pos1: [number, number] = [0, 0];
    const pos2: [number, number] = [0, 1];
    const pos3: [number, number] = [0, 2];

    const node1 = { id: 'node-1', type: EntityType.Node, tags: {}, position: pos1 };
    const node2 = { id: 'node-2', type: EntityType.Node, tags: {}, position: pos2 };
    const node3 = { id: 'node-3', type: EntityType.Node, tags: {}, position: pos3 };

    const path1 = { id: 'path-1', type: EntityType.Path, tags: {}, nodes: [node1, node2, node3, node1] };

    let graph = new Graph<typeof node1, typeof path1>([]);
    let updater = graph.beginUpdate();

    // initial state
    updater.addNode(node1);
    updater.addNode(node2);
    updater.addNode(node3);

    updater.addPath(path1);

    graph = updater.commit();

    // next state
    updater = graph.beginUpdate();
    updater.removeEntity(path1.id);
    updater.removeEntity(node1.id);
    updater.removeEntity(node2.id);
    updater.removeEntity(node3.id);

    graph = updater.commit();

    expect(graph.entities.length).toBe(0);

    done();
  });

  it('should have entityPaths correctly when draw a path containing the existing node of another path', (done) => {
    const pos1: [number, number] = [0, 0];
    const pos2: [number, number] = [0, 1];
    const pos3: [number, number] = [0, 2];
    const pos4: [number, number] = [0, 3];
    const pos5: [number, number] = [0, 4];
    const pos6: [number, number] = [0, 5];

    const node1 = { id: 'node-1', type: EntityType.Node, tags: {}, position: pos1 };
    const node2 = { id: 'node-2', type: EntityType.Node, tags: {}, position: pos2 };
    const node3 = { id: 'node-3', type: EntityType.Node, tags: {}, position: pos3 };
    const node4 = { id: 'node-4', type: EntityType.Node, tags: {}, position: pos4 };
    const node5 = { id: 'node-5', type: EntityType.Node, tags: {}, position: pos5 };
    const node6 = { id: 'node-6', type: EntityType.Node, tags: {}, position: pos6 };

    const path1 = { id: 'path-1', type: EntityType.Path, tags: {}, nodes: [node1, node2, node3, node4, node1] };
    const path2 = { id: 'path-2', type: EntityType.Path, tags: {}, nodes: [node1, node5, node6, node1] };

    // init
    let graph = new Graph<typeof node1, typeof path1>([]);
    let updater = graph.beginUpdate();

    updater.addNode(node1);
    updater.addNode(node2);
    updater.addNode(node3);
    updater.addNode(node4);
    updater.addPath(path1);
    graph = updater.commit();

    // next state
    updater = graph.beginUpdate();
    updater.replaceEntity(node1);
    updater.addNode(node5);
    updater.addNode(node6);
    updater.addPath(path2);
    graph = updater.commit();

    expect(graph.getEntityPaths('node-5').length).toBe(1);
    expect(graph.getEntityPaths('node-6').length).toBe(1);

    done();
  });

  it('should copy paths and nodes with newId correctly', (done) => {
    const pos1: [number, number] = [0, 0];
    const pos2: [number, number] = [0, 1];
    const pos3: [number, number] = [0, 2];

    const node1 = { id: 'node-1', type: EntityType.Node, tags: {}, position: pos1 };
    const node2 = { id: 'node-2', type: EntityType.Node, tags: {}, position: pos2 };
    const node3 = { id: 'node-3', type: EntityType.Node, tags: {}, position: pos3 };
    const path1 = { id: 'path-1', type: EntityType.Path, tags: {}, nodes: [node1, node2, node3, node1] };

    const node1c = { id: 'node-1c', type: EntityType.Node, tags: {}, position: pos1 };
    const node2c = { id: 'node-2c', type: EntityType.Node, tags: {}, position: pos2 };
    const node3c = { id: 'node-3c', type: EntityType.Node, tags: {}, position: pos3 };
    const path1c = { id: 'path-1c', type: EntityType.Path, tags: {}, nodes: [node1c, node2c, node3c, node1c] };

    // init
    let graph = new Graph<typeof node1, typeof path1>([]);
    let updater = graph.beginUpdate();

    updater.addNode(node1);
    updater.addNode(node2);
    updater.addNode(node3);
    updater.addPath(path1);
    graph = updater.commit();

    // next state
    updater = graph.beginUpdate();

    updater.addNode(node1c);
    updater.addNode(node2c);
    updater.addNode(node3c);
    updater.addPath(path1c);
    graph = updater.commit();

    done();
  });

  // TODO
  // order should not be matter when delete path and nodes
  // now it matters if we delete path first and then all nodes of that path
});
