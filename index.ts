import { Ref, ref, UnwrapRef } from 'vue';


export type EffectFunction<Args extends any[], Result> = (...args: Args) => Promise<Result>;
export type EffectEvent =
    'onBefore'
    | 'onSuccess'
    | 'onError'
    | 'onFinally';

export type Effect<Args extends any[], Result> = {
    (...args: Args): Promise<Result>;
    onSuccess: (callback: (result: Result, ...args: Args) => void) => void;
    onError: (callback: (error: unknown, ...args: Args) => void) => void;
    onFinally: (callback: (...args: Args) => void) => void;
    onBefore: (callback: (...args: Args) => void) => void;
};

export type Payload<Result, Args> = {
    result?: Result;
    error?: unknown;
    args: Args;
};
export type Handler<State, Args, Result> = (state: [ State ] extends [ Ref ]
                                                   ? IfAny<State, Ref<State>, State>
                                                   : Ref<UnwrapRef<State>, UnwrapRef<State> | State>, payload: Payload<Result, Args>) => void;
export type IfAny<T, Y, N> = 0 extends 1 & T ? Y : N;

export function effect<Args extends any[], Result> (fn: EffectFunction<Args, Result>): Effect<Args, Result> {
    let beforeListeners: ((...args: Args) => void)[]                  = [];
    let successListeners: ((result: Result, ...args: Args) => void)[] = [];
    let errorListeners: ((error: unknown, ...args: Args) => void)[]   = [];
    let finallyListeners: ((...args: Args) => void)[]                 = [];

    const wrappedEffect: Effect<Args, Result> = async (...args: Args) => {
        beforeListeners.forEach(listener => listener(...args));
        try {
            const result = await fn(...args);
            successListeners.forEach(listener => listener(result, ...args));
            return result;
        } catch (error) {
            errorListeners.forEach(listener => listener(error, ...args));
            throw error;
        } finally {
            finallyListeners.forEach(listener => listener(...args));
        }
    };

    wrappedEffect.onBefore = (callback: (...args: Args) => void) => {
        beforeListeners.push(callback);
    };

    wrappedEffect.onSuccess = (callback: (result: Result, ...args: Args) => void) => {
        successListeners.push(callback);
    };

    wrappedEffect.onError = (callback: (error: unknown, ...args: Args) => void) => {
        errorListeners.push(callback);
    };

    wrappedEffect.onFinally = (callback: (...args: Args) => void) => {
        finallyListeners.push(callback);
    };

    return wrappedEffect;
}

export type Store<State> = {
    get: () => [ State ] extends [ Ref ]
               ? IfAny<State, Ref<State>, State>
               : Ref<UnwrapRef<State>, UnwrapRef<State> | State>;
    on: <Args extends any[], Result>(
        effect: Effect<Args, Result>,
        event: EffectEvent,
        handler: Handler<State, Args, Result>,
    ) => Store<State>;
};


export function store<State> (initialState: State): Store<State> {
    const state = ref(initialState);

    const get = () => state;
    const on  = <Args extends any[], Result> (
        effect: Effect<Args, Result>,
        event: EffectEvent,
        handler: Handler<State, Args, Result>,
    ): Store<State> => {
        const callback = (payload: Payload<Result, Args>) => handler(state, payload);

        if (event === 'onBefore') {
            effect.onBefore((...args) => callback({ args }));
        } else if (event === 'onSuccess') {
            effect.onSuccess((result, ...args) => callback({
                result,
                args,
            }));
        } else if (event === 'onError') {
            effect.onError((error, ...args) => callback({ error, args }));
        } else if (event === 'onFinally') {
            effect.onFinally((...args) => callback({ args }));
        }

        return storeApi;
    };

    const storeApi = { get, on };

    return storeApi;
}

export const useStore = function <State> (store: Store<State>) {
    return store.get();
};