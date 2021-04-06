import EntityType from '../../src/EntityType';
import EntityUpdater from '../../src/update/EntityUpdater';

describe('EntityUpdater', () => {
  it('proxy works', () => {
    type MyEntityType = { position: [number, number] };
    let updater = new EntityUpdater<MyEntityType, {}>(
      { position: [2, 2], id: '1', type: EntityType.Node, tags: [] },
      (e: MyEntityType) => {
        return {};
      }
    );

    updater
      .position([1, 2])
      .end();

  });


});
