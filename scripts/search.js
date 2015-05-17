import SearchApp from 'alt-search-docs'
import React from 'react'

const github = /goatslacker.github.io\/alt/

if (github.test(location.href)) {
  location.href = location.href.replace(github, 'alt.js.org')
}

React.render(
  <SearchApp url="/assets/search.json" />,
  document.getElementById('alt-search-app')
)
