import { customRef } from 'vue';
import { Store } from '@vanyamate/sec';


export const useStore = function <Type> (store: Store<Type>) {
    return customRef((track, trigger) => {
        const get = store.get;
        const set = store.set;

        store.get = () => {
            track();
            return get();
        };

        store.set = (value: Type) => {
            set(value);
            trigger();
        };

        return store;
    });
};