const http = require('https')

var accessToken

/**
 * Sets the access key to the Wit.ai API.
 *
 * @param {String} key The access key to the Wit.ai API.
 */
function setKey (key) {
  accessToken = key
}

/**
 * Gets the text and intents from raw audio.
 *
 * Audio must be little-endian 16-bit signed integers at 16Hz.
 * Makes an HTTP request to the Wit.ai API.
 *
 * @param {Buffer} pcmData The Buffer containing raw audio.
 * @param {Function} callback The callback that receives the text after it is returned.
 * @param {Function} handler The handler for if the HTTP request errors.
 */
function getText (pcmData, callback, handler) {
  if (!handler) handler = console.log
  if (!callback) callback = console.log

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'audio/raw;encoding=signed-integer;bits=16;rate=16000;endian=little;'
  }
  const method = 'POST'
  const apiVersion = '20200513'
  const path = `/speech?v=${apiVersion}`
  const host = 'api.wit.ai'

  const options = {
    host: host,
    path: path,
    headers: headers,
    method: method
  }

  const req = http.request(options, resp => {
    resp.setEncoding('utf8')
    let message = ''

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

/**
 * Gets the text and intents from an audio stream.
 *
 * Audio must be little-endian 16-bit signed integers at 16Hz.
 * Makes an HTTP request to the Wit.ai API.
 *
 * @param {ReadableStream} pcmData The ReadableStream containing raw audio.
 * @param {EventEmitter} flag The emitter that signifies when to stop reading from the stream.
 * @param {Function} callback The callback that receives the text after it is returned.
 * @param {Function} handler The handler for if the HTTP request errors.
 */
function getStreamText (stream, flag, callback, handler) {
  if (!handler) handler = console.log
  if (!callback) callback = console.log

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'audio/raw;encoding=signed-integer;bits=16;rate=16000;endian=little;',
    'Transfer-encoding': 'chunked'
  }
  const method = 'POST'
  const apiVersion = '20200513'
  const path = `/speech?v=${apiVersion}`
  const host = 'api.wit.ai'

  const options = {
    host: host,
    path: path,
    headers: headers,
    method: method
  }

  const req = http.request(options, resp => {
    resp.setEncoding('utf8')
    let message = ''

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
