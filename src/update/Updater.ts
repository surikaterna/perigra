type Updater<T, TParent> = {
    [K in keyof T as `update${Capitalize<string & K>}`]: (newValue: T[K]) => Updater<T, TParent>;
}

// class Test implements Updater<{test:string}, any> {
//     test:string = '123';
//     updateTest(newValue:string) {
//         this.test = newValue;
//         return this;
//     }
// }