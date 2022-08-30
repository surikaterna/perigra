import EntityType from '../src/EntityType';
import Graph from '../src/Graph';
import GraphUpdater from '../src/update/GraphUpdater';

describe('GraphUpdater', () => {
  it('creates with one Node', () => {
    const updater = new GraphUpdater();
    updater.addEntity({ id: '123', type: EntityType.Node, tags: {} });
    const graph = updater.commit();
    expect(Array.from(graph.entities()).length).toEqual(1);
    expect(graph.getEntity('123').id).toEqual('123');
  });

  it('removes comitted Node', () => {
    let updater = new GraphUpdater();
    updater.addEntity({ id: '123', type: EntityType.Node, tags: {} });
    updater = updater.commit().beginUpdate();
    updater.removeEntity('123');
    const graph = updater.commit();
    expect(Array.from(graph.entities()).length).toEqual(0);
  });

  it('add and remove Node in same transaction', () => {
    let updater = new GraphUpdater();
    updater.addNode({ id: '123', type: EntityType.Node, tags: {}, position: [1, 1] });
    updater.removeEntity('123');
    const graph = updater.commit();
    expect(Array.from(graph.entities()).length).toEqual(0);
  });

  it('update a committed node', () => {
    let updater = new GraphUpdater();
    updater.addEntity({ id: '123', type: EntityType.Node, tags: {} });
    updater = updater.commit().beginUpdate();
    updater.replaceEntity({ id: '123', type: EntityType.Node, tags: { hello: true } });
    const graph = updater.commit();
    expect(Array.from(graph.entities()).length).toEqual(1);
    expect(graph.getEntity('123').tags.hello).toEqual(true);
  });

  it('should get correct paths for specify node', (done) => {
    const pos1: [number, number] = [0, 0];
    const pos2: [number, number] = [0, 1];
    const node1 = { id: 'node-1', type: EntityType.Node, tags: {}, position: pos1 };
    const node2 = { id: 'node-2', type: EntityType.Node, tags: {}, position: pos2 };
    const path1 = { id: 'path-1', type: EntityType.Path, tags: {}, nodes: [node1, node2] };

    let graph = new Graph<typeof node1, typeof path1>([]);
    const updater = graph.beginUpdate();

    updater.addNode(node1);
    updater.addNode(node2);
    updater.addPath(path1);

    graph = updater.commit();

    expect(graph.getEntityPaths('node-1')).toEqual([path1]);
    expect(graph.getEntityPaths('node-2')).toEqual([path1]);

    done();
  });

  it('should update paths and entitiesPaths when a node is replaced', (done) => {
    const pos1: [number, number] = [0, 0];
    const pos2: [number, number] = [0, 1];
    const pos3: [number, number] = [0, 2];
    const pos4: [number, number] = [0, 3];
    const node1 = { id: 'node-1', type: EntityType.Node, tags: {}, position: pos1 };
    const node2 = { id: 'node-2', type: EntityType.Node, tags: {}, position: pos2 };
    const node1Updated = { id: 'node-1', type: EntityType.Node, tags: {}, position: pos3 };
    const node2Updated = { id: 'node-2', type: EntityType.Node, tags: {}, position: pos4 };
    const path1 = { id: 'path-1', type: EntityType.Path, tags: {}, nodes: [node1, node2] };

    let graph = new Graph<typeof node1, typeof path1>([]);
    let updater = graph.beginUpdate();

    updater.addNode(node1);
    updater.addNode(node2);
    updater.addPath(path1);

    graph = updater.commit();

    updater = graph.beginUpdate();

    updater.replaceEntity(node1Updated);

    graph = updater.commit();
    expect(graph.getNode('node-1')).toEqual(node1Updated);
    expect(graph.getPath('path-1').nodes).toEqual([node1Updated, node2]);

    updater = graph.beginUpdate();
    updater.replaceEntity(node2Updated);
    graph = updater.commit();
    expect(graph.getNode('node-2')).toEqual(node2Updated);
    expect(graph.getPath('path-1').nodes).toEqual([node1Updated, node2Updated]);

    done();
  });
});
