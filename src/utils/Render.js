import React from 'react'

function renderWithStrategy(
  alt,
  renderFunc,
  Element,
  info,
  start = Date.now(),
  iterations = 0,
  lastResults = null
) {
  // FIXME: Add error handling here.

  if (lastResults) {
    alt.bootstrap(lastResults.state)

    lastResults.futureResults.forEach((futureResult, i) => {
      const [succeeded, result] = futureResult
      const continuation = lastResults.continuations[i]

      if (succeeded) {
        continuation.onSuccess(result)
      } else {
        continuation.onError(result)
      }
    })
  }

  const futures = []
  const continuations = []
  alt.buffer = {futures, continuations}

  const html = renderFunc(Element)

  alt.buffer = null
  const state = alt.flush()

  if (futures.length) {
    return Promise.all(futures).then(futureResults => renderWithStrategy(
      alt,
      renderFunc,
      Element,
      info,
      start,
      iterations + 1,
      {state, futureResults, continuations}
    ))
  } else {
    const time = Date.now() - start

    return Promise.resolve({
      html, state,
      diagnostics: {iterations, time}
    })
  }
}

export default class Render {
  constructor(alt, options = {}) {
    this.alt = alt
    this.options = options

    // defaults
    // 500ms or 5 iteration max
    this.options.timeout = options.timeout || 500
    this.options.maxIterations = options.maxIterations || 5
  }

  toString(Element) {
    return renderWithStrategy(
      this.alt,
      React.renderToString,
      Element,
      this.options
    )
  }

  toStaticMarkup(Element) {
    return renderWithStrategy(
      this.alt,
      React.renderToStaticMarkup,
      Element,
      this.options
    )
  }
}
