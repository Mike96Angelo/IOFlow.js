declare type IOFunc<TInput, TOutput> = (input: TInput) => TOutput;
interface IOFlow<TInput, TOutput> {
    (input: TInput): void;
    addSubscriber: (subscriber: IOFlow<TOutput, any>) => void;
    removeSubscriber: (subscriber: IOFlow<TOutput, any>) => void;
    subscribeTo: (...subscriptions: IOFlow<any, TInput>[]) => void;
    unsubscribeFrom: (...subscriptions: IOFlow<any, TInput>[]) => void;
}
interface IOFlowOptions {
    throttle?: number;
    debounce?: number;
}
export default function createIOFlow<TInput, TOutput>(ioFunc: IOFunc<TInput, TOutput>, options?: IOFlowOptions): IOFlow<TInput, TOutput>;
export {};
