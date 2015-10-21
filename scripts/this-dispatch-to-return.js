const isDispatch = path => (
  path.value.type === 'CallExpression' &&
  path.value.callee.type === 'MemberExpression' &&
//  path.value.callee.object.type === 'ThisExpression' && // commented out so we support var self = this; self.dispatch();
  path.value.callee.property.type === 'Identifier' &&
  path.value.callee.property.name === 'dispatch'
)

const isThisActions = path => (
  path.value.type === 'MemberExpression' &&
  path.value.object.type === 'MemberExpression' &&
  path.value.object.property.type === 'Identifier' &&
  path.value.object.property.name === 'actions'
)

const updateDispatchToReturn = j => (p) => {
  j(p).replaceWith(j.returnStatement(p.value.arguments[0] || null))
}

const updateDispatchToCall = j => (p) => {
  j(p).replaceWith(j.callExpression(j.identifier('dispatch'), p.value.arguments))
}

const updateToJustThis = j => (p) => {
  j(p).replaceWith(j.memberExpression(p.value.object.object, p.value.property))
}

const findDispatches = (j, p) => {
  return j(p).find(j.CallExpression).filter(isDispatch)
}

const findThisActionReferences = (j, p) => {
  return j(p).find(j.MemberExpression).filter(isThisActions)
}

const replaceFunction = (j, p) => {
  j(p).replaceWith(j.functionExpression(
    null,
    p.value.params,
    j.blockStatement([
      j.returnStatement(
        j.functionExpression(
          null,
          [j.identifier('dispatch')],
          j.blockStatement(p.value.body.body)
        )
      )
    ])
  ))
}

module.exports = (file, api) => {
  const j = api.jscodeshift
  const root = j(file.source)

  root.find(j.FunctionExpression).forEach((p) => {
    // ignore constructors
    if (p.parent.value.type === 'MethodDefinition' && p.parent.value.kind === 'constructor') {
      return
    }

    // find all dispatches that are inside the function
    const dispatches = findDispatches(j, p).size()
    const withinParent = findDispatches(j, p).filter(x => x.parent.parent.parent.value === p.value).size()

    if (withinParent === 0 && dispatches > 0) {
      replaceFunction(j, p)
      findDispatches(j, p).forEach(updateDispatchToCall(j))

    } else if (dispatches === 0) {
      const hasReturn = j(p).find(j.ReturnStatement).size() > 0
      if (hasReturn) {
        console.warn('Could not transform function because it returned', 'at line', p.parent.value.loc.start.line)
      } else {
        console.warn('This function does not dispatch?', 'at line', p.parent.value.loc.start.line)
      }

    // if there are multiple dispatches happening then we'll need to return a
    // dispatch function and update this.dispatch to a dispatch call
    } else if (dispatches > 1) {
      replaceFunction(j, p)
      findDispatches(j, p).forEach(updateDispatchToCall(j))

    // if there's a single dispatch then it's ok to return to dispatch
    } else {
      // if its the only statement within the function
      if (p.value.body.body.length === 1) {
        findDispatches(j, p).forEach(updateDispatchToReturn(j))
      // otherwise lets run the function
      } else {
        replaceFunction(j, p)
        findDispatches(j, p).forEach(updateDispatchToCall(j))
      }
    }

    // Also find any mentions to `this.actions`
    findThisActionReferences(j, p).forEach(updateToJustThis(j))
  })

  return root.toSource({ quote: 'single' })
}
