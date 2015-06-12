var alt = require('../alt')
var merge = require('object-assign')

var TodoActions = require('../actions/TodoActions')

var todoStore = alt.createStore(class TodoStore {
  constructor() {
    this.bindActions(TodoActions)

    this.todos = {}
  }

  update(id, updates) {
    if(this.todos[id] && updates){
      this.todos[id] = merge(this.todos[id], updates)
    }
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

    text = text ? text.trim() : ''
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
