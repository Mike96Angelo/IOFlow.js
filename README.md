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
let doSomething = myButtonHandler.addSubscriber((event) => {
  // Some cool code here
  // Return some value that will be passed to any subscribers.
})
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

  let updateA = sourceOfA.addSubscriber((newA) => a = newA)
  let updateB = sourceOfB.addSubscriber((newB) => b = newB)

  let handler = createIOFlow(() => a + b)

  updateA.addSubscriber(handler)
  updateB.addSubscriber(handler)
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
myButtonHandler.addSubscriber((event) => Analytics.send('myButtonClicked'))
myButton2Handler.addSubscriber((event) => Analytics.send('myButton2Clicked'))


/* Want Logs?  Keep things tidy; all logs in one place. */
let myLog = createIOFlow((event) => console.log('myLog', event))
  
myButtonHandler.addSubscriber(myLog)
myButton2Handler.addSubscriber(myLog)
// You can subscribe to any number of IOFLow sources


/* Need to unsubscribe?  Sure, its easy! */
myIOFlow.removeSubscriber(myOtherIOFlow)


/* Don't want to send anything to your subscribers? */
let myThing = createIOFlow((input, stopPropagation) => {
  if (someCondition) {
    return stopPropagation()
    // Don't send to subscribers
  }
})


/* Can I call an IOFlow directly?  Sure you can! */
myIOFlow(data)
// This will process data then send the result to any subscribers.
// You should only call an IOFlow if it is a source node -- meaning it doesn't 
// subscribe to any one else. 

// e.g. myAPI.getArticle({id: 1}) where myAPI.getArticle is an IOFlow.
// This means you can have some UI renderer that subscribes to myAPI.getArticle
// and when ever myAPI.getArticle finishes your UI renderer will get called with
// the article.
```
