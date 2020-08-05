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
 * Transforms a 2-channel audio stream to 1-channel.
 */
class TransformStream extends Transform {
  /**
   * Calls the super constructor.
   *
   * @param {*} source Unused parameter.
   * @param {Object} options Any options to pass in for a Transform stream.
   */
  constructor (source, options) {
    super(options)
  }

  /**
   * Transforms data to 1 channel.
   *
   * @param {Buffer} data The buffer containing the audio data to transform.
   * @param {*} encoding Unused parameter.
   * @param {Function} next The next function to call.
   */
  _transform (data, encoding, next) {
    next(null, convertTo1Channel(data))
  }
}

const SILENCE_FRAME = Buffer.from([0xF8, 0xFF, 0xFE])

/**
 * Pushes silence frames whenever it is read from.
 */
class Silence extends Readable {
  /**
   * Pushes a Buffer representing a silence frame.
   */
  _read () {
    this.push(SILENCE_FRAME)
  }
}

exports.TransformStream = TransformStream
exports.Silence = Silence
