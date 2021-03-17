import EntityType from '../src/EntityType';
import GraphUpdater from '../src/update/GraphUpdater';

describe('GraphUpdater', () => {
  it('change position of node', () => {
    let updater = new GraphUpdater<{ position: [number, number] }, {},{}>();
    updater
      .addNode({ id: '123', type: EntityType.Node, tags: {}, position: [0, 0, 2] })
      .position([1, 2])
      .end()
      .commit();

    updater = updater.commit().beginUpdate();
    updater.replaceEntity({ id: '123', type: EntityType.Node, tags: { hello: true } })
    const graph = updater.commit();
    expect(Array.from(graph.entities()).length).toEqual(1);
    expect(graph.getEntity('123').tags.hello).toEqual(true);
  });


});
