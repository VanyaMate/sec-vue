import { Ref, UnwrapRef } from 'vue';
export type EffectFunction<Args extends any[], Result> = (...args: Args) => Promise<Result>;
export type EffectEvent = 'onBefore' | 'onSuccess' | 'onError' | 'onFinally';
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
export type Handler<State, Args, Result> = (state: [State] extends [Ref] ? IfAny<State, Ref<State>, State> : Ref<UnwrapRef<State>, UnwrapRef<State> | State>, payload: Payload<Result, Args>) => void;
export type IfAny<T, Y, N> = 0 extends 1 & T ? Y : N;
export declare function effect<Args extends any[], Result>(fn: EffectFunction<Args, Result>): Effect<Args, Result>;
export type Store<State> = {
    get: () => [State] extends [Ref] ? IfAny<State, Ref<State>, State> : Ref<UnwrapRef<State>, UnwrapRef<State> | State>;
    on: <Args extends any[], Result>(effect: Effect<Args, Result>, event: EffectEvent, handler: Handler<State, Args, Result>) => Store<State>;
};
export declare function store<State>(initialState: State): Store<State>;
export declare const useStore: <State>(store: Store<State>) => [State] extends [Ref<any, any>] ? IfAny<State, Ref<State, State>, State> : Ref<UnwrapRef<State>, State | UnwrapRef<State>>;
