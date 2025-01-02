import { customRef } from 'vue';
export const useStore = function (store) {
    return customRef((track, trigger) => {
        const get = store.get;
        const set = store.set;
        store.get = () => {
            track();
            return get();
        };
        store.set = (value) => {
            set(value);
            trigger();
        };
        return store;
    });
};
