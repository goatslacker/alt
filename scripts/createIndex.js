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

function addDocument(name, idx) {
  const markdown = String(fs.readFileSync(name)).split('---')

  const topdoc = markdown[1]

  const body = markdown.slice(2, markdown.length).join('')

  const doc = topdoc
    .split('\n')
    .filter(Boolean)
    .reduce(function (obj, prop) {
      const keyVal = prop.split(':')
      obj[keyVal[0]] = keyVal[1].trim()
      return obj
    }, { id: idx, body: body })

  index.add(doc)

  return {
    id: doc.id,
    title: doc.title,
    description: doc.description,
    body: doc.body,
    permalink: doc.permalink
  }
}

function isDir(fullpath) {
  try {
    return fs.statSync(fullpath).isDirectory()
  } catch (err) {
    return null
  }
}

function fromDirectory(dir) {
  return fs.readdirSync(dir).reduce(function (dirs, file) {
    const fullpath = path.join(dir, file)
    if (isDir(fullpath)) {
      dirs.push.apply(dirs, fromDirectory(path.join(fullpath)))
    } else if (/.md$/.test(file)) {
      dirs.push(fullpath)
    }
    return dirs
  }, [])
}

const documents = fromDirectory('../docs')
  .concat(fromDirectory('../guides'))
  .map(addDocument)

const searchData = {
  docs: documents,
  index: index.toJSON()
}

fs.writeFileSync('./assets/search.json', JSON.stringify(searchData))
