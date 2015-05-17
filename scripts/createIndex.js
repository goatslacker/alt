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

  return {
    id: doc.id,
    title: doc.title,
    description: doc.description,
    body: doc.body,
    permalink: doc.permalink
  }
}

const docsdir = fs.readdirSync('../docs')

const documents = docsdir.filter(function (file) {
  return /.md$/.test(file)
}).map(addDocument)

const searchData = {
  docs: documents,
  index: index.toJSON()
}

fs.writeFileSync('./assets/search.json', JSON.stringify(searchData))
