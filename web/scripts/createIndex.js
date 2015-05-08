const fs = require('fs')
const path = require('path')
const lunr = require('lunr')

const index = lunr(function () {
  this.field('title', { boost: 10 })
  this.field('description', { boost: 5 })
  this.field('body')
  this.field('layout')
  this.field('permalink')
})

function addDocument(name) {
  const markdown = String(fs.readFileSync('../docs/' + name)).split('---')

  const topdoc = markdown[1]

  const body = markdown.slice(2, markdown.length).join('')

  const doc = topdoc
    .split('\n')
    .filter(Boolean)
    .reduce(function (obj, prop) {
      const keyVal = prop.split(':')
      obj[keyVal[0]] = keyVal[1].trim()
      return obj
    }, { id: name, body: body })

  index.add(doc)
}

const docsdir = fs.readdirSync('../docs')
docsdir.forEach(function (file) {
  if (/.md$/.test(file)) {
    addDocument(file)
  }
})

const search_json = JSON.stringify(index.toJSON())

fs.writeFileSync('./assets/search.json', search_json)
