# IOFlow.js
IOFlow is a simple but powerful data flow library.

examples:
```javascript
/* setup an input */
let createIOFlow = require('ioflow')

let myButton = document.getElementById('my-button')

let myButtonHandler = createIOFlow((event) => event)
myButton.onclick = myButtonHandler


/* do something with the input stream */
let doSomething = createIOFlow((event) => {
  // some cool code here
  // return some value that will be passed to any subscribers.
})

doSomething.subscribeTo(myButtonHandler) 
// this means that doSomething is called with the result of 
// myButtonHandler being called which happens when myButton is clicked.


/* Don't want button spamming? use debounce or throttle */
let myButton2 = document.getElementById('my-button-2')

let myButton2Handler = createIOFlow((event) => event, { debounce: 200 })
myButton2.onclick = myButton2Handler
// this means that myButton2Handler's internal func will only get called when 
// the button hasn't been clicked for 200ms.  The last event value will be passed.

let myButton3 = document.getElementById('my-button-3')

let myButton3Handler = createIOFlow((event) => event, { throttle: 200 })
myButton3.onclick = myButton3Handler
// this means that myButton2Handler's internal func will get called every 200ms.  The last event value in the 200ms interval will be passed.


/* depend on multiple IOFlow sources to create a new output? */
let myMultiSourceHandler = (function () {
  let a = 0
  let b = 0

  let updateA = createIOFlow((newA) => a = newA)
  let updateB = createIOFlow((newB) => b = newB)

  updateA.subscribeTo(sourceOfA)
  updateB.subscribeTo(sourceOfB)

  let handler = createIOFlow(() => a + b)

  handler.subscribeTo(updateA, updateB)
  // if either updateA or updateB is called then handler will be called.

  return handler
}())


/* need async await or promises? they work just fine! */
let myAsyncThing = createIOFlow(async (input) => {
  let result = await myAPICall(input)

  // do something with result and return some value
})

// or just return a promise.  It waits for it to get resolved before calling 
// any subscribers.
let myAsyncThing2 = createIOFlow((input) => myAPICall(input))


/* Want Analytics? Keep things tidy; all analytics in one place. */
createIOFlow((event) => Analytics.send('myButtonClicked'))
  .subscribeTo(myButtonHandler)


/* Want Logs? Keep things tidy; all logs in one place. */
let myLog = createIOFlow((event) => console.log('myLog', event))
  
myLog.subscribeTo(myButtonHandler)
// myLog.subscribeTo(myOtherButtonHandler) // you can subscribe to any number of
// IOFLow sources


/* need to unsubscribe? sure, but why would you need to! */
myIOFlow.unsubscribeFrom(myOtherIOFlow)


/* can I call an IOFlow directly? sure you can! but its best to avoid it. */
myIOFlow(data)
// this will process data then send the result to any subscribers.
// this pattern should be avoided, the only time that this pattern 
// should be used is on app startup.
```