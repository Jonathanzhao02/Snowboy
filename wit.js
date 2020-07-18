const http = require('https')

var accessToken

function setKey (key) {
  accessToken = key
}

function getText (pcmData, callback, handler) {
  if (!handler) handler = console.log
  if (!callback) callback = console.log

  var headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'audio/raw;encoding=signed-integer;bits=16;rate=16000;endian=little;'
  }
  var method = 'POST'
  var apiVersion = '20200513'
  var path = `/speech?v=${apiVersion}`
  var host = 'api.wit.ai'

  var options = {
    host: host,
    path: path,
    headers: headers,
    method: method
  }

  var req = http.request(options, resp => {
    resp.setEncoding('utf8')
    var message = ''

    resp.on('data', chunk => {
      message += chunk
    })

    resp.on('end', () => {
      callback(JSON.parse(message))
    })

    resp.on('error', (err) => {
      handler(err)
    })
  })
  req.write(pcmData)
  req.end()
}

function getStreamText (stream, flag, callback, handler) {
  if (!handler) handler = console.log
  if (!callback) callback = console.log

  var headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'audio/raw;encoding=signed-integer;bits=16;rate=16000;endian=little;',
    'Transfer-encoding': 'chunked'
  }
  var method = 'POST'
  var apiVersion = '20200513'
  var path = `/speech?v=${apiVersion}`
  var host = 'api.wit.ai'

  var options = {
    host: host,
    path: path,
    headers: headers,
    method: method
  }

  var req = http.request(options, resp => {
    resp.setEncoding('utf8')
    var message = ''

    resp.on('data', chunk => {
      message += chunk
    })

    resp.on('end', () => {
      callback(JSON.parse(message))
    })

    resp.on('error', (err) => {
      handler(err)
    })
  })
  stream.pipe(req)

  flag.on('finish', () => {
    flag.removeAllListeners()
    stream.unpipe(req)
    req.end()
  })
}

exports.getText = getText
exports.getStreamText = getStreamText
exports.setKey = setKey
