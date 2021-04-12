import { RecordUpdater } from '../ObjectUpdater';

const createRecordUpdater = <T extends Record<string, any>, TParent>(orgTarget: T, resultCallback: (result: T) => TParent) => {
    const changes: Record<string, any> = {};
    const objectHandler = {
        get: (target: T, key: string, receiver: RecordUpdater<T, TParent>) => {
            return (...args: any) => {
                let result: any = receiver;
                if (key === 'replace') {
                    changes[args[0]] = args[1];
                } else if (key === 'add') {
                    changes[args[0]] = args[1];
                } else if (key === 'remove') {
                    delete changes[args[0]];
                } else if (key === 'end') {
                    const value = { ...target, ...changes };
                    result = resultCallback(value);
                } else {
                    throw new Error('Record Proxy unable to resolve intention!! ' + key);
                }
                return result;
            }
        }
    };
    return <RecordUpdater<T, TParent>>new Proxy<any>(orgTarget, objectHandler);
};

export default createRecordUpdater;