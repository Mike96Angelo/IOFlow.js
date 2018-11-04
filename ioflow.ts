type IOFunc<TInput, TOutput> = (
  input: TInput
) => Promise<TOutput> | TOutput

type IOFuncCaller<TInput> = (
  input: TInput,
  $_stack: Set<IOFlow<any, any>>
) => void

interface IOFlow<TInput, TOutput> {
  (input: TInput): void
  addSubscriber: (subscriber: IOFlow<TOutput, any>) => void
  removeSubscriber: (subscriber: IOFlow<TOutput, any>) => void
  subscribeTo: (...subscriptions: IOFlow<any, TInput>[]) => void
  unsubscribeFrom: (...subscriptions: IOFlow<any, TInput>[]) => void
}

interface CreateIOFlow<TInput, TOutput> {
  (input: TInput, $_stack: Set<IOFlow<any, any>>): void
  addSubscriber?: IOFlow<TInput, TOutput>['addSubscriber']
  removeSubscriber?: IOFlow<TInput, TOutput>['removeSubscriber']
  subscribeTo?: IOFlow<TInput, TOutput>['subscribeTo']
  unsubscribeFrom?: IOFlow<TInput, TOutput>['subscribeTo']
}

interface IOFlowOptions {
  throttle?: number
  debounce?: number
}

const SUBSCRIPTION_ERROR = 'IOFlow is subscribed to itself or one of its subscribers.'

const assertNotInIOFlowStack = (
  ioFlow: IOFlow<any, any>,
  $_stack: Set<IOFlow<any, any>>
) => {
  if ($_stack.has(ioFlow)) {
    throw new Error(SUBSCRIPTION_ERROR)
  }
  $_stack.add(ioFlow)
}

export default function createIOFlow<TInput, TOutput>(
  ioFunc: IOFunc<TInput, TOutput>,
  options?: IOFlowOptions,
): IOFlow<TInput, TOutput> {
  let ioFlow: CreateIOFlow<TInput, TOutput>

  const subscribers = new Set<IOFlow<TOutput, any>>()

  const ioFuncCaller: IOFuncCaller<TInput> = async (
    input,
    $_stack = new Set
  ) => {
    assertNotInIOFlowStack(
      ioFlow as IOFlow<TInput, TOutput>,
      $_stack
    )

    const output = await ioFunc(input)

    subscribers.forEach(
      (subscriber) => {
        (subscriber as CreateIOFlow<TOutput, any>)(
          output,
          $_stack
        )
      }
    )
  }

  ioFlow = (
    input,
    $_stack
  ) => {
    ioFuncCaller(input, $_stack)
  }

  if (options != null) {
    let lastInput: TInput

    if (options.throttle != null) {
      let calling = false

      ioFlow = (
        input,
        $_stack
      ) => {
        lastInput = input

        if (!calling) {
          setTimeout(
            () => {
              ioFuncCaller(lastInput, $_stack)
              calling = false
            },
            options.throttle
          )

          calling = true
        }
      }
    }

    if (options.debounce != null) {
      let timeout: any

      ioFlow = (
        input,
        $_stack
      ) => {
        lastInput = input

        clearTimeout(timeout)

        timeout = setTimeout(
          () => ioFuncCaller(lastInput, $_stack),
          options.debounce
        )
      }
    }
  }

  ioFlow.addSubscriber = (
    subscriber
  ) => {
    subscribers.add(subscriber)
  }

  ioFlow.removeSubscriber = (
    subscriber
  ) => {
    subscribers.delete(subscriber)
  }

  ioFlow.subscribeTo = (
    ...subscriptions
  ) => {
    subscriptions.forEach(
      (subscription) => subscription.addSubscriber(
        ioFlow as IOFlow<TInput, TOutput>
      ),
    )
  }

  ioFlow.unsubscribeFrom = (
    ...subscriptions
  ) => {
    subscriptions.forEach(
      (subscription) => subscription.removeSubscriber(
        ioFlow as IOFlow<TInput, TOutput>
      ),
    )
  }

  return ioFlow as IOFlow<TInput, TOutput>
}
