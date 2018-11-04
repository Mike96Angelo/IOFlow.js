# IOFlow.js
IOFlow is a simple but powerful data flow library.

examples:
```javascript
/* Setup an input */
let createIOFlow = require('ioflow')

let myButton = document.getElementById('my-button')

let myButtonHandler = createIOFlow((event) => event)
myButton.onclick = myButtonHandler


/* do something with the input stream */
let doSomething = createIOFlow((event) => {
  // Some cool code here
  // Return some value that will be passed to any subscribers.
})

doSomething.subscribeTo(myButtonHandler) 
// This means that doSomething is called with the result of 
// myButtonHandler being called which happens when myButton is clicked.


/* Don't want button spamming?  Use debounce or throttle */
let myButton2 = document.getElementById('my-button-2')

let myButton2Handler = createIOFlow((event) => event, { debounce: 200 })
myButton2.onclick = myButton2Handler
// This means that myButton2Handler's internal func will only get called when 
// the button hasn't been clicked for 200ms.  The last event value will be passed.

let myButton3 = document.getElementById('my-button-3')

let myButton3Handler = createIOFlow((event) => event, { throttle: 200 })
myButton3.onclick = myButton3Handler
// This means that myButton2Handler's internal func will get called every 200ms.  
// The last event value in the 200ms interval will be passed.


/* Depend on multiple IOFlow sources to create a new output? */
let myMultiSourceHandler = (function () {
  let a = 0
  let b = 0

  let updateA = createIOFlow((newA) => a = newA)
  let updateB = createIOFlow((newB) => b = newB)

  updateA.subscribeTo(sourceOfA)
  updateB.subscribeTo(sourceOfB)

  let handler = createIOFlow(() => a + b)

  handler.subscribeTo(updateA, updateB)
  // If either updateA or updateB is called then handler will be called.

  return handler
}())


/* Need async await or promises?  They work just fine! */
let myAsyncThing = createIOFlow(async (input) => {
  let result = await myAPICall(input)

  // Do something with result and return some value
})

// Or just return a promise.  It waits for it to get resolved before calling 
// any subscribers.
let myAsyncThing2 = createIOFlow((input) => myAPICall(input))


/* Want Analytics?  Keep things tidy; all analytics in one place. */
createIOFlow((event) => Analytics.send('myButtonClicked'))
  .subscribeTo(myButtonHandler)


/* Want Logs?  Keep things tidy; all logs in one place. */
let myLog = createIOFlow((event) => console.log('myLog', event))
  
myLog.subscribeTo(myButtonHandler)
// myLog.subscribeTo(myOtherButtonHandler) 
// You can subscribe to any number of IOFLow sources


/* Need to unsubscribe?  Sure, but why would you need to? */
myIOFlow.unsubscribeFrom(myOtherIOFlow)


/* Can I call an IOFlow directly?  Sure you can! but its best to avoid it. */
myIOFlow(data)
// This will process data then send the result to any subscribers.
// This pattern should be avoided, the only time that this pattern 
// should be used is on app startup.
```
