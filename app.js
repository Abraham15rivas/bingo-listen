const express = require('express')
const app = express()
const http = require('http').Server(app)
const bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(bodyParser.raw())

require('dotenv').config()

const io = require('socket.io')(http, {
  cors: {
    origin: [
      process.env.MIX_BINGO_FRONT_URL,
      process.env.MIX_BINGO_BACK_URL
    ],
    methods: [ 'GET', 'POST' ],
    credentials: true
  }
})

const appPort = process.env.PORT || 4000

http.listen(appPort, () => {
  console.log(`Server running at ${appPort}`)
})

io.on('connection', (socket) => {
  console.log('User connected')

  socket.on('disconnect', () => {
    console.log('User disconnected')
  })
})

app.get('/', (req, res) => {
  res.send('Welcome to the home page')
})

app.post('/issue-number', (req, res) => {
  let numbers = req.body.numbers
  console.log(numbers)
  io.sockets.emit('update_cardboard', { numbers })
  res.send('Numbers')
})