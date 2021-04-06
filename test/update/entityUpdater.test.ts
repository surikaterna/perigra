import ObjectUpdater from '../../src/update/ObjectUpdater';

// import EntityType from '../../src/EntityType';
// import GraphUpdater from '../../src/update/GraphUpdater';

// class ChangeCollector {
//   // private changes = 
//   queue(prop: string, value: any) {
//     // this.
//   }
// }



const createObjectUpdater = <T, TParent>(target: T, resultCallback: (result:T)=>TParent) => {
  const objectHandler = {
    get: (target, key: string, receiver) => {
      console.log('**** PXY', target, key, receiver);
      return () => {
        let result = receiver;
        console.log('**** PXY()', target, key, receiver);
        if (key.startsWith('update')) {
          console.log('**** update()', target, key, receiver);
        } else if (key.endsWith('AsObject')) {
          result = createObjectUpdater(target, () => { });
        } else if (key.endsWith('AsRecord')) {
          console.log('**** asRecord()', target, key, receiver);
        } else if (key === 'end') {
          console.log('**** THE END()', target, key, receiver);
        } else {
          throw new Error('Proxy unable to resolve intention!!');
        }
        return receiver;
      }
    },
  }
  return <T>new Proxy<any>(target, objectHandler)
}

describe('entityUpdater', () => {
  it.only('change position of node', () => {


    const upg: ObjectUpdater<MyEntity, {}> = new Proxy<any>({},);

    type MyEntity = {
      position: [number, number],
      id: string,
      tags: Record<string, string>,
      body: { nose: string, arm: boolean, hand: { fingers: number } }
    }

    upg
      .updatePosition([12, 23])
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
      .updateBody({ nose: '666', arm: false, hand: { fingers: 12 } })
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
