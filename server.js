import express from 'express'
import foo from './foo'
import Iso from 'iso'

const app = express()

app.get('/', (req, res) => {
  const props = {}

  foo.server(props).then((obj) => {
    console.log('Server done...', obj)
    const html = Iso.render(obj.html, obj.state, {
      props,
      buffer: obj.buffer
    })

    if (obj.error) console.log(obj.error.stack)

    res.send(`
      <html>
        <head></head>
        <body>
          ${html}
        </body>
        <script src="/build.js"></script>
      </html>
    `)
  }).catch((e) => {
    res.send(`:(<br />${e.stack}`)
  })
})

import fs from 'fs'

const buildjs = fs.readFileSync('./build.js')

app.get('/build.js', (req, res) => {
  res.send(buildjs)
})

app.listen(3000, stat => console.log('Listening', 3000))
