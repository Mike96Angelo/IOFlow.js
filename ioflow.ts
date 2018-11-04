type IOFunc<TInput, TOutput> = (input: TInput) => TOutput
type IOFuncCaller<TInput> = (input: TInput) => void

interface IOFlow<TInput, TOutput> {
  (input: TInput): void
  addSubscriber: (subscriber: IOFlow<TOutput, any>) => void
  removeSubscriber: (subscriber: IOFlow<TOutput, any>) => void
  subscribeTo: (...subscriptions: IOFlow<any, TInput>[]) => void
  unsubscribeFrom: (...subscriptions: IOFlow<any, TInput>[]) => void
}

interface CreateIOFlow<TInput, TOutput> {
  (input: TInput): void
  addSubscriber?: IOFlow<TInput, TOutput>['addSubscriber']
  removeSubscriber?: IOFlow<TInput, TOutput>['removeSubscriber']
  subscribeTo?: IOFlow<TInput, TOutput>['subscribeTo']
  unsubscribeFrom?: IOFlow<TInput, TOutput>['subscribeTo']
}

interface IOFlowOptions {
  throttle?: number
  debounce?: number
  // animationFrame / setImmediate
  // immediate?: true
}

export default function createIOFlow<TInput, TOutput>(
  ioFunc: IOFunc<TInput, TOutput>,
  options?: IOFlowOptions,
): IOFlow<TInput, TOutput> {
  const subscribers = new Set<IOFlow<TOutput, any>>()

  const ioFuncCaller: IOFuncCaller<TInput> = async (input) => {
    const output = await ioFunc(input)

    subscribers.forEach(
      (subscriber) => subscriber(output),
    )
  }

  let ioFlow: CreateIOFlow<TInput, TOutput> = (input) => {
    ioFuncCaller(input)
  }

  if (options != null) {
    let lastInput: TInput

    if (options.throttle != null) {
      let calling = false

      ioFlow = (input) => {
        lastInput = input

        if (!calling) {
          setTimeout(() => {
            ioFuncCaller(lastInput)
            calling = false
          }, options.throttle)

          calling = true
        }
      }
    }

    if (options.debounce != null) {
      let timeout: any

      ioFlow = (input) => {
        lastInput = input

        clearTimeout(timeout)

        timeout = setTimeout(() => ioFuncCaller(lastInput), options.debounce)
      }
    }
  }

  ioFlow.addSubscriber = (subscriber) => {
    subscribers.add(subscriber)
  }

  ioFlow.removeSubscriber = (subscriber) => {
    subscribers.delete(subscriber)
  }

  ioFlow.subscribeTo = (...subscriptions) => {
    subscriptions.forEach(
      (subscription) => subscription.addSubscriber(ioFlow as IOFlow<TInput, TOutput>),
    )
  }

  ioFlow.unsubscribeFrom = (...subscriptions) => {
    subscriptions.forEach(
      (subscription) => subscription.removeSubscriber(ioFlow as IOFlow<TInput, TOutput>),
    )
  }

  return ioFlow as IOFlow<TInput, TOutput>
}
