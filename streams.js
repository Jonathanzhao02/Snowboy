const { Transform, Readable } = require('stream')

function convertTo1Channel (buffer) {
  const newBuf = Buffer.alloc(buffer.length / 2)

  for (var i = 0; i < newBuf.length / 2; i++) {
    const uint16 = buffer.readUInt16LE(i * 4)
    newBuf.writeUInt16LE(uint16, i * 2)
  }

  return newBuf
}

class TransformStream extends Transform {
  constructor (source, options) {
    super(options)
  }

  _transform (data, encoding, next) {
    next(null, convertTo1Channel(data))
  }
}

const SILENCE_FRAME = Buffer.from([0xF8, 0xFF, 0xFE])

class Silence extends Readable {
  _read () {
    this.push(SILENCE_FRAME)
  }
}

exports.TransformStream = TransformStream
exports.Silence = Silence
