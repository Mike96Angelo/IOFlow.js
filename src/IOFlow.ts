const SUBSCRIPTION_ERROR = 'IOFlow is subscribed to itself or one of its subscribers.'

const assertNotInIOFlowStack = (
  ioFlow: CreateIOFlow<any, any>,
  $_stack: Set<CreateIOFlow<any, any>>
) => {
  if ($_stack.has(ioFlow)) {
    throw new Error(SUBSCRIPTION_ERROR)
  }
  $_stack.add(ioFlow)
}

const isIOFlow = <TInput, TOutput>(test: any): test is IOFlow<TInput, TOutput> =>
  test instanceof Function
  && test.addSubscriber instanceof Function
  && test.removeSubscriber instanceof Function
  && test.unsubscribeFromAll instanceof Function

const isIOFunc = <TInput, TReturn>(test: any): test is IOFunc<TInput, TReturn> =>
  test instanceof Function
  && test.addSubscriber === undefined
  && test.removeSubscriber === undefined
  && test.unsubscribeFromAll === undefined

const _createIOFlow = <TInput, TOutput>(
  ioFunc: IOFunc<TInput, TOutput>,
  options?: IOFlowOptions
): IOFlow<TInput, TOutput> => {
  let ioFlow: CreateIOFlow<TInput, TOutput>

  const subscriptions = new Set<CreateIOFlow<TOutput, any>>()
  const subscribers = new Set<CreateIOFlow<TOutput, any>>()

  const ioFuncCaller: IOFuncCaller<TInput> = async (
    input,
    $_stack = new Set
  ) => {
    assertNotInIOFlowStack(
      ioFlow,
      $_stack
    )

    let stopped = false

    const stopPropagation = () => {
      stopped = true
    }

    const output = await ioFunc(input, stopPropagation)

    if (!stopped) {
      subscribers.forEach(
        (subscriber) => {
          subscriber(
            output,
            $_stack
          )
        }
      )
    }
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

  ioFlow.addSubscriber = <TReturn>(
    subscriber: IOFunc<TOutput, TReturn>,
    options?: IOFlowOptions,
  ) => {
    let ioFlowSubscriber: IOFlow<TOutput, TReturn>

    if (isIOFlow<TOutput, TReturn>(subscriber)) {
      if (subscribers.has(subscriber)) {
        return subscriber
      }

      ioFlowSubscriber = subscriber
    } else if (isIOFunc<TOutput, TReturn>(subscriber)) {
      ioFlowSubscriber = _createIOFlow(subscriber, options)
    } else {
      throw new TypeError(
        `Expected first argument to be a function, but found ${typeof subscriber}`
      )
    }

    (ioFlowSubscriber as CreateIOFlow<TOutput, TReturn>)
      ._addSubscription!(ioFlow)

    subscribers.add(ioFlowSubscriber)

    return ioFlowSubscriber
  }

  ioFlow._addSubscription = (
    subscription,
  ) => {
    subscriptions.add(subscription)
  }

  ioFlow.removeSubscriber = (
    subscriber
  ) => {
    (subscriber as CreateIOFlow<TOutput, any>)
      ._removeSubscription!(ioFlow)

    subscribers.delete(subscriber)
  }

  ioFlow._removeSubscription = (
    subscription,
  ) => {
    subscriptions.delete(subscription)
  }

  ioFlow.unsubscribeFromAll = () => {
    subscriptions.forEach((subscription) => {
      subscription.removeSubscriber!(
        ioFlow as IOFlow<TInput, TOutput>
      )
    })
  }

  ioFlow.removeAllSubscribers = () => {
    subscribers.forEach((subscriber) => {
      ioFlow.removeSubscriber!(
        subscriber as IOFlow<any, any>
      )
    })
  }

  ioFlow.destroy = () => {
    ioFlow.unsubscribeFromAll!()
    ioFlow.removeAllSubscribers!()
  }

  return ioFlow as IOFlow<TInput, TOutput>
}

export default function createIOFlow<
  InferredInputs extends IOFlow<any, Never<Input, any>>[],
  Return,
  Input = never
  >(
    func: (
      input: Input | GetInferredInputs<InferredInputs>
    ) => Return,
    options: IOFlowOptions = {},
    ...sources: InferredInputs
  ): IOFlow<Never<Input, unknown> | GetInferredInputs<InferredInputs>, Return> {
  const ioFlow = _createIOFlow(func, options)

  sources.forEach((source) => {
    source.addSubscriber(ioFlow)
  })

  return ioFlow as any
}
