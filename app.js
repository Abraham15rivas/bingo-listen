const express = require('express')
const app = express()
const http = require('http').Server(app)
const axios = require('axios')
const bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(bodyParser.raw())

require('dotenv').config()

const authorizationToken = process.env.MIX_OCULAR_AUTHORIZATION_TOKEN

const io = require('socket.io')(http, {
  cors: {
    origin: [
      process.env.MIX_OCULAR_URL,
      process.env.MIX_OCULAR_ADMIN_URL,
      process.env.MIX_OCULAR_URL_TEST,
      process.env.MIX_OCULAR_WIDGET_APP_URL
    ],
    methods: [ 'GET', 'POST' ],
    credentials: true
  }
})

const ocularUrl = process.env.MIX_OCULAR_URL_API
const appPort = process.env.PORT || 4000

const users = []
let waitingList = []

http.listen(appPort, () => {
  console.log(`Server running at ${appPort}`)
})

const authorization = (token = null) => {
  const authorized = token && token === authorizationToken

  return {
    state: authorized,
    message: authorized ? 'Authorized access' : 'Access denied'
  }
}

app.get('/', (req, res) => {
  const token = req.query.authorizationToken

  if (!token) {
    res.send({
      listenAuthorization: {
        state: false,
        message: "Access denied"
      }
    })
    return
  }

  const auth = authorization(token)

  if (!auth.state) { 
    res.send({ listenAuthorization: auth })
    return
  }

  res.send('Welcome to the home page')
})

app.post('/get-cammers-by-category', (req, res) => {
  const token = req.body.authorizationToken

  if (!token) {
    res.send({
      listenAuthorization: {
        state: false,
        message: "Access denied"
      }
    })
    return
  }

  const auth = authorization(token)

  if (!auth.state) { 
    res.send({ listenAuthorization: auth })
    return
  }

  const categoryId = req.body.category_id
  const organizationId = req.body.organization_id
  const response = findUserByCategory(organizationId, categoryId)

  res.send(response)
})
