export default function generateAsyncActions(alt, ...actionNames) {
  const actionsList = actionNames.reduce((list, action) => {
    list.push(`${action}Starting`, `${action}Success`, `${action}Failure`)
    return list
  }, [])

  return alt.generateActions(...actionsList)
}
