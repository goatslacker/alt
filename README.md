# alt

A batteries-included, Best Practices™, approach to managing state within large, complex applications.

[![NPM version](https://badge.fury.io/js/alt.svg)](http://badge.fury.io/js/alt)
[![Build Status](https://secure.travis-ci.org/goatslacker/alt.svg?branch=master)](http://travis-ci.org/goatslacker/alt)
[![JS.ORG](https://img.shields.io/badge/js.org-alt-ffb400.svg?style=flat-square)](http://js.org)

## Install

```sh
npm install alt --save
```

## Usage

__Action Creators__

```js
import Alt from 'alt'

function sendEmail(to, body) {
  // Mocked async call
  return Promise.resolve({
    to,
    body,
  })
}

export default Alt.getActionCreators('Email', {
  send(to, body) {
    return Alt.asyncDispatch(
      sendEmail(to, body)
    )
  },
})
```

__State Branches__

```js
import { Branch } from 'alt'

import EmailActions from './EmailActions'
import alt from './alt'

class SentBox extends Branch {
  constructor() {
    this.namespace = 'SentBox'

    this.respondToAsync(EmailActions.send, {
      success: this.emailSent.bind(this),
    })

    this.state = {
      list: [],
    }
  }

  emailSent(email) {
    const { list } = this.state

    this.setState({ list: list.concat(email) })
  }
}

export default alt.addBranch(new SentBox())
```

## Goals & Motivation

This library takes all the good pieces of Alt like single state tree, serialization, loading, ease-of-use, and lays it on top of a Redux-backed foundation with a few utilities included for managing asynchronous actions, and injecting your own branch state managers or reducers at runtime.

* Async & Error handling in a neat package
* Injectable reducers
* Lots of community plugins available
* Serialization/Loading
* Small API based on best practices that evolved around Alt

## License

[![MIT](https://img.shields.io/npm/l/alt.svg?style=flat)](http://josh.mit-license.org)
