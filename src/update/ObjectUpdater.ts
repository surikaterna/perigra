import { EntityStateCannotChange } from '../Entity';

type GetRecordKeyType<Type> = Type extends Record<infer Key, unknown> ? Key : never;

type GetRecordValueType<Type> = Type extends Record<string | number | symbol, infer Return> ? Return : never;

export type RecordUpdater<T, TParent, Key = GetRecordKeyType<T>, Value = GetRecordValueType<T>> = {
  remove(key: Key): RecordUpdater<T, TParent>;
  add(key: Key, value: Value): RecordUpdater<T, TParent>;
  replace(key: Key, value: Value): RecordUpdater<T, TParent>;
  end(): TParent;
};

type ObjectUpdater<T, TParent> = {
  // Update of properties
  [K in keyof T as K extends keyof EntityStateCannotChange ? never : `update${Capitalize<string & K>}`]: (newValue: T[K]) => ObjectUpdater<T, TParent>;
} & {
  // special case for records
  [K in keyof T as T[K] extends Record<string | number | symbol, unknown> ? `${Uncapitalize<string & K>}AsRecord` : never]: () => RecordUpdater<
    T[K],
    ObjectUpdater<T, TParent>
  >;
} & {
  // special case for objects
  [K in keyof T as T[K] extends Record<string | number | symbol, unknown> ? `${Uncapitalize<string & K>}AsObject` : never]: () => ObjectUpdater<
    T[K],
    ObjectUpdater<T, TParent>
  >;
} & { end: () => TParent };

export default ObjectUpdater;
