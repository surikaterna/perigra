import EntityType from '../src/EntityType';
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
    const graph = updater.commit()
    expect(Array.from(graph.entities()).length).toEqual(0);
  }); 

  it('add and remove Node in same transaction', () => {
    let updater = new GraphUpdater();
    updater.addNode({ id: '123', type: EntityType.Node, tags: {}, position: [1, 1] });
    updater.removeEntity('123');
    const graph = updater.commit()
    expect(Array.from(graph.entities()).length).toEqual(0);
  });

  it('update a committed node', () => {
    let updater = new GraphUpdater();
    updater.addEntity({ id: '123', type: EntityType.Node, tags: {} });
    updater = updater.commit().beginUpdate();
    updater.replaceEntity({ id: '123', type: EntityType.Node, tags: { hello: true } })
    const graph = updater.commit();
    expect(Array.from(graph.entities()).length).toEqual(1);
    expect(graph.getEntity('123').tags.hello).toEqual(true);
  });
});
