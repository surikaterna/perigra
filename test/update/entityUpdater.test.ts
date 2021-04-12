import createObjectUpdater from '../../src/update/updaters/createObjectUpdater';

type MyEntity = {
  position: [number, number],
  id: string,
  tags: Record<string, string>,
  body: { nose: string, arm: boolean, hand: { fingers: number } }
}

const deepFreeze = <T extends Record<string, any>>(obj: T) => {
  Object.keys(obj).forEach(prop => {
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


describe.only('entityUpdater', () => {
  it('change property of node', (async) => {
    const upg = createObjectUpdater(myEntityTemplate, (res) => {
      expect(res.position).toEqual([12, 23]);
      expect(myEntityTemplate.position).toEqual([1, 1]);
      async();
      return {};
    });

    upg
      .updatePosition([12, 23])
      .end();
  });

  it('change sub object of node', (async) => {
    const upg = createObjectUpdater(myEntityTemplate, (res) => {
      expect(res.body.arm).toEqual(true);
      expect(myEntityTemplate.body.arm).toEqual(false);
      async();
      return {};
    });

    upg
      .bodyAsObject()
        .updateArm(true)
      .end()
    .end();
  });  

  it('change sub record of node', (async) => {
    const upg = createObjectUpdater(myEntityTemplate, (res) => {
      expect(res.tags.as).toEqual('123123');
      expect(myEntityTemplate.tags.as).toBeUndefined();
      async();
    });

    upg
      .tagsAsRecord()
        .replace('as', '123123')
      .end()
    .end();
  });  
});
