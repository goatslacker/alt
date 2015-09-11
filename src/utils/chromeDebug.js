/* global window */
export default function chromeDebug(alt) {
  if (typeof window !== 'undefined') window['alt.js.org'] = alt
  return alt
}
