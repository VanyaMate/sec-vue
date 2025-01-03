import { ref } from 'vue';
export function effect(fn) {
    let beforeListeners = [];
    let successListeners = [];
    let errorListeners = [];
    let finallyListeners = [];
    const wrappedEffect = async (...args) => {
        beforeListeners.forEach(listener => listener(...args));
        try {
            const result = await fn(...args);
            successListeners.forEach(listener => listener(result, ...args));
            return result;
        }
        catch (error) {
            errorListeners.forEach(listener => listener(error, ...args));
            throw error;
        }
        finally {
            finallyListeners.forEach(listener => listener(...args));
        }
    };
    wrappedEffect.onBefore = (callback) => {
        beforeListeners.push(callback);
    };
    wrappedEffect.onSuccess = (callback) => {
        successListeners.push(callback);
    };
    wrappedEffect.onError = (callback) => {
        errorListeners.push(callback);
    };
    wrappedEffect.onFinally = (callback) => {
        finallyListeners.push(callback);
    };
    return wrappedEffect;
}
export function store(initialState) {
    const state = ref(initialState);
    const get = () => state;
    const on = (effect, event, handler) => {
        const callback = (payload) => handler(state, payload);
        if (event === 'onBefore') {
            effect.onBefore((...args) => callback({ args }));
        }
        else if (event === 'onSuccess') {
            effect.onSuccess((result, ...args) => callback({
                result,
                args,
            }));
        }
        else if (event === 'onError') {
            effect.onError((error, ...args) => callback({ error, args }));
        }
        else if (event === 'onFinally') {
            effect.onFinally((...args) => callback({ args }));
        }
        return storeApi;
    };
    const storeApi = { get, on };
    return storeApi;
}
export const useStore = function (store) {
    return store.get();
};
