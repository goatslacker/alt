import SearchApp from 'alt-search-docs'; //eslint-disable-line
import React from 'react'; //eslint-disable-line
import ReactDOM from 'react-dom'; //eslint-disable-line

const github = /goatslacker.github.io\/alt/;

if (github.test(location.href)) {
    location.href = location.href.replace(github, 'alt.js.org');
}

ReactDOM.render(
  <SearchApp url="/assets/search.json" />,
    document.getElementById('alt-search-app')
);
