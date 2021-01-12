import EntityType from '../src/EntityType';
import GraphUpdater from '../src/update/GraphUpdater';

describe('GraphUpdater', () => {
  it('creates with one Node', () => {
    const updater = new GraphUpdater();
    updater.addEntity({ id: '123', type: EntityType.Node, tags: [] });
    const graph = updater.commit();
    expect(Array.from(graph.entities()).length).toEqual(1);

  });
});
