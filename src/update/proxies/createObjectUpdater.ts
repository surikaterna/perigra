import ObjectUpdater from '../ObjectUpdater';
import createRecordUpdater from './createRecordUpdater';

const createObjectUpdater = <T extends Record<string, any>, TParent>(orgTarget: T, resultCallback: (result: T) => TParent) => {
  const changes: Record<string, any> = {};
  const objectHandler = {
    get: (target: T, key: string, receiver: ObjectUpdater<T, TParent>) => {
      return (arg?: any) => {
        let result: any = receiver;
        if (key.startsWith('update')) {
          const prop = key.charAt(6).toLocaleLowerCase() + key.substring(7);
          changes[prop] = arg;
        } else if (key.endsWith('AsObject')) {
          const prop: string = key.substring(0, key.length - 8);
          result = createObjectUpdater<Record<string, any>, ObjectUpdater<T, TParent>>(target[prop] || {}, (res) => {
            changes[prop] = res;
            return receiver;
          });
        } else if (key.endsWith('AsRecord')) {
          const prop: string = key.substring(0, key.length - 8);
          result = createRecordUpdater<Record<string, any>, ObjectUpdater<T, TParent>>(target[prop] || {}, (res) => {
            changes[prop] = res;
            return receiver;
          });
        } else if (key === 'end') {
          const value = { ...target, ...changes };
          return resultCallback(value);
        } else {
          throw new Error('Object Proxy unable to resolve intention!! ' + key);
        }
        return result;
      };
    }
  };
  return new Proxy<any>(orgTarget, objectHandler) as ObjectUpdater<T, TParent>;
};
export default createObjectUpdater;
