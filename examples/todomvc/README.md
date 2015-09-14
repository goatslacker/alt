# Alt TodoMVC Example

> A copy of [flux-todomvc](https://github.com/facebook/flux/tree/master/examples/flux-todomvc) but using alt

## What is this?

This is todomvc written to work with alt. It's mostly the same code as flux's todomvc, in fact I only changed a couple of lines in the view layer. The bulk of the changes were in the store and actions, and the removal of the dispatcher and the constants since alt handles those two for you.

## Learning Flux

I won't document learning flux here, you can check out Flux's todomvc [README](https://github.com/facebook/flux/tree/master/examples/flux-todomvc/README.md) which has a great overview. Alt is essentially flux so the concepts translate over well.

## Alt and Flux

Instead, I'll use this space to talk about why alt and compare it to flux.


### Folder Structure

The folder structure is very similar with the difference in that alt omits the `constants` and `dispatcher`

Your tree would look something like this:

```
./
  index.html
  js/
    actions/
      TodoActions.js
    app.js
    bundle.js
    components/
      Footer.react.js
      Header.react.js
      MainSection.react.js
      TodoApp.react.js
      TodoItem.react.js
      TodoTextInput.react.js
    stores/
      TodoStore.js
```

You can read more about what the rest of the files do [here](https://github.com/facebook/flux/blob/master/examples/flux-todomvc/README.md#todomvc-example-implementation).

### Terse Syntax

One of the main benefits of alt is the terse syntax. The actions in flux are ~80 LOC, and the dispatcher is ~15 LOC. With alt you can write both in ~15 LOC.

Here are the actions:

```js
var alt = require('../alt')

class TodoActions {
  constructor() {
    this.generateActions(
      'create',
      'updateText',
      'toggleComplete',
      'toggleCompleteAll',
      'destroy',
      'destroyCompleted'
    )
  }
}

module.exports = alt.createActions(TodoActions)
```

The store on flux clocks in at ~160 LOC. In alt the store is 80 LOC.

Here's the store:

```js
var alt = require('../alt')
var merge = require('object-assign')

var TodoActions = require('../actions/TodoActions')

var todoStore = alt.createStore(class TodoStore {
  constructor() {
    this.bindActions(TodoActions)

    this.todos = {}
  }

  update(id, updates) {
    this.todos[id] = merge(this.todos[id], updates)
  }

  updateAll(updates) {
    for (var id in this.todos) {
      this.update(id, updates)
    }
  }

  onCreate(text) {
    text = text.trim()
    if (text === '') {
      return false
    }
    // hand waving of course.
    var id = (+new Date() + Math.floor(Math.random() * 999999)).toString(36)
    this.todos[id] = {
      id: id,
      complete: false,
      text: text
    }
  }

  onUpdateText(x) {
    var { id, text } = x
    text = text.trim()
    if (text === '') {
      return false
    }
    this.update(id, { text })
  }

  onToggleComplete(id) {
    var complete = !this.todos[id].complete
    this.update(id, { complete })
  }

  onToggleCompleteAll() {
    var complete = !todoStore.areAllComplete()
    this.updateAll({ complete })
  }

  onDestroy(id) {
    delete this.todos[id]
  }

  onDestroyCompleted() {
    for (var id in this.todos) {
      if (this.todos[id].complete) {
        this.onDestroy(id)
      }
    }
  }

  static areAllComplete() {
    var { todos } = this.getState()
    for (var id in todos) {
      if (!todos[id].complete) {
        return false
      }
    }
    return true
  }
})

module.exports = todoStore
```


### Running

Install the dependencies first

```
npm install
```

Build a package

```
npm run build
```

Open index.html in your browser

```
open index.html
```

## Credit

The original flux TodoMVC application was created by [Bill Fisher](https://www.facebook.com/bill.fisher.771). All the view components and most of the rest of the code was written by Bill. The actions and stores have been alted by [Josh Perez](https://github.com/goatslacker)
