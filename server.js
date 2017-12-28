const express = require('express')
const logger = require('morgan')
const bodyParser = require('body-parser')
const http = require('http')
const { exec } = require('child_process')

let app = express()

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use((req, res, next) => {
  res.header('Content-Type', 'application/json')
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Request-Method', 'OPTIONS, GET, POST, PUT, PATCH, HEAD, DELETE')
  res.header('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, HEAD, DELETE')
  res.header('Access-Control-Allow-Headers', '*, content-type')

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }
  next()
})

/**
 * @method  GET
 * @description Returns the list of registered processes
 */
app.get('/', function (req, res, next) {
  let jobs = []

  exec('pm2 jlist', (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`)
      return
    }

    let processList = JSON.parse(stdout)

    jobs = jobs.concat(processList)
    console.log(JSON.stringify(processList, null, 2))
    res.send(jobs)
  })
})

app.put('/:jobId/stop', function (req, res, next) {
  exec('pm2 stop ' + req.params.jobId, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`)
      return res.status(400).send({error: 'An error has occurred'})
    }
    res.send({status: true})
  })
})

app.put('/:jobId/start', function (req, res, next) {
  exec('pm2 start ' + req.params.jobId, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`)
      return res.status(400).send({error: 'An error has occurred'})
    }
    res.send({status: true})
  })
})

app.put('/:jobId/delete', function (req, res, next) {
  exec('pm2 delete ' + req.params.jobId, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`)
      return res.status(400).send({error: 'An error has occurred'})
    }
    res.send({status: true})
  })
})
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.send(err)
})

let server = http.createServer(app)

/**
 * Listen on provided port, on all network interfaces.
 */
let port = process.env.PORT || 4000
server.listen(port)
server.on('error', (err) => {
  console.log('Server error', err)
})
server.on('listening', () => {
  console.log('HTTP Server started on port ' + port)
})
