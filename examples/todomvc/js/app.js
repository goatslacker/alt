var TodoApp = require('./components/TodoApp.react')
var React = require('react')
React.render(
  React.createElement(TodoApp, {}),
  document.getElementById('todoapp')
)
