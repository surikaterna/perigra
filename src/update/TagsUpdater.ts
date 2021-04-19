/**
 * Any tag change will result in a replace of the parent entity
 * */
export default class TagsUpdater<T> {
  private parent: T;

  constructor(parent: T) {
    this.parent = parent;
  }

  // add(key: string, value: any) {
  //     // this.parent.queue()
  // }
  // replace(key: string, value: any) {
  //     // this.parent.queue()
  // }
  // remove(key: string) {

  // }

  end(): T {
    return this.parent;
  }
}
