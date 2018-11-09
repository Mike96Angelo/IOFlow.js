type IfIs<A, B, Then, Else> = [A] extends [B] ? Then : Else

type Never<T, Default> = IfIs<T, never, Default, T>

type Void<T, Default> = IfIs<T, void, Default, T>

type ArrayTypes<T> = T extends Array<infer K>
  ? K
  : never

type IOFlowOutput<T> = T extends IOFlow<any, infer K>
  ? K
  : never

type GetIOFlowOutputTypes<T> = {
  [K in keyof T]: T[K] extends IOFlow<any, any>
  ? Void<IOFlowOutput<T[K]>, undefined>
  : never
}

type GetInferredInputs<T extends IOFlow<any, any>[]> = ArrayTypes<GetIOFlowOutputTypes<T>>

interface IOFunc<TInput, TOutput> {
  (
    input: TInput,
    stopPropagation: () => void
  ): Promise<TOutput> | TOutput
}

interface IOFuncCaller<TInput> {
  (
    input: TInput,
    $_stack: Set<CreateIOFlow<any, any>>
  ): void
}

interface IOFlow<TInput, TOutput> {
  (
    input: TInput
  ): void
  addSubscriber: <TReturn>(
    ioFunc: IOFunc<TOutput, TReturn>,
    options?: IOFlowOptions
  ) => IOFlow<TOutput, TReturn>
  removeSubscriber: (
    ioFlow: IOFlow<any, TInput>,
  ) => void
  unsubscribeFromAll: () => void
  removeAllSubscribers: () => void
  destroy: () => void
}

interface CreateIOFlow<TInput, TOutput> {
  (
    input: TInput,
    $_stack: Set<CreateIOFlow<any, any>>
  ): void
  addSubscriber?: IOFlow<TInput, TOutput>['addSubscriber']
  removeSubscriber?: IOFlow<TInput, TOutput>['removeSubscriber']
  unsubscribeFromAll?: IOFlow<TInput, TOutput>['unsubscribeFromAll']
  removeAllSubscribers?: IOFlow<TInput, TOutput>['removeAllSubscribers']
  destroy?: IOFlow<TInput, TOutput>['destroy']
  _addSubscription?: (
    ioFlow: CreateIOFlow<any, TInput>,
  ) => void
  _removeSubscription?: (
    ioFlow: CreateIOFlow<any, TInput>,
  ) => void
}

interface IOFlowOptions {
  throttle?: number
  debounce?: number
}

