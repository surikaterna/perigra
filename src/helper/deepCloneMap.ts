export default function deepCloneMap(source: Map<any, any[]>) {
  const cloned = new Map();
  source.forEach((value, key) => {
    cloned.set(key, [...value]);
  });
  return cloned;
}
