const { Transform, Readable } = require('stream')

/**
 * Converts 2-channel audio data to 1 channel by taking every other value.
 *
 * @param {Buffer} buffer The 2-channel audio data to convert.
 */
function convertTo1Channel (buffer) {
  const newBuf = Buffer.alloc(buffer.length / 2)

  for (var i = 0; i < newBuf.length / 2; i++) {
    const uint16 = buffer.readUInt16LE(i * 4)
    newBuf.writeUInt16LE(uint16, i * 2)
  }

  return newBuf
}

/**
 * Transforms data to 1 channel.
 *
 * @param {*} source Unused parameter.
 * @param {Object} options Any options to pass in for a Transform stream.
 */
function TransformStream (source, options) {
  Transform.call(this, options)
}

TransformStream.prototype = Object.create(Transform.prototype)

/**
 * Transforms data to 1 channel.
 *
 * @param {Buffer} data The buffer containing the audio data to transform.
 * @param {*} encoding Unused parameter.
 * @param {Function} next The next function to call.
 */
TransformStream.prototype._transform = function (data, encoding, next) {
  next(undefined, convertTo1Channel(data))
}

const SILENCE_FRAME = Buffer.from([0xF8, 0xFF, 0xFE])

/**
 * Pushes silence frames whenever it is read from.
 */
function Silence () {
  Readable.call(this)
}

Silence.prototype = Object.create(Readable.prototype)

/**
 * Pushes a Buffer representing a silence frame.
 */
Silence.prototype._read = function () {
  this.push(SILENCE_FRAME)
}

exports.TransformStream = TransformStream
exports.Silence = Silence
