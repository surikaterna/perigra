import ObjectUpdater, {RecordUpdater} from '../../src/update/ObjectUpdater';
import createObjectUpdater from '../../src/update/updaters/createObjectUpdater';

// import EntityType from '../../src/EntityType';
// import GraphUpdater from '../../src/update/GraphUpdater';

// class ChangeCollector {
//   // private changes = 
//   queue(prop: string, value: any) {
//     // this.
//   }
// }




describe('entityUpdater', () => {
  it.only('change position of node', () => {

    type MyEntity = {
      position: [number, number],
      id: string,
      tags: Record<string, string>,
      body: { nose: string, arm: boolean, hand: { fingers: number } }
    }

    const upg: ObjectUpdater<MyEntity, {}> = createObjectUpdater<MyEntity, {}>({
      position: [1, 1],
      id: 'abc',
      tags: { hello: 'world' },
      body: { nose: 'yes', arm: false, hand: { fingers: 10 } }
    }, (res) => {
      console.log('res', res);
      return {};
    });


    upg
      .updatePosition([12, 23])
      .updatePosition([66, 99])
      .bodyAsObject()
      .updateNose('123')
      .updateArm(true)
      .handAsObject()
      .updateFingers(12)
      .end()
      .end()
      .bodyAsRecord()
      .replace('nose', '999')
        .replace('arm', 'hello')
        .add('hand', false)
      .end()
      .tagsAsRecord()
        .replace('asdasd', 'asdasd')
      .end()
      .updateTags({ aa: 'bb' })
      .updateBody({ nose: '666', arm: false, hand: { fingers: 16 } })
      .end()

    // .updatePosition([12, 23])
    // .entityKeya().updateNose('hello').end()

    // .openTags()
    // .add('test', 'value')
    // .remove('test2')
    // .end()
    // .end()
    // .commit()
  });
});
