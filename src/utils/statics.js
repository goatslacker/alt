function addStatics(obj) {
  return (Component) => {
    Object.keys(obj).forEach((key) => {
      Component[key] = obj[key]
    })
    return Component
  }
}

export default function statics(obj, Component) {
  return Component
    ? addStatics(obj)(Component)
    : addStatics(obj)
}
