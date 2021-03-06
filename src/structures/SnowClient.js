const { Models, Detector } = require('snowboy')
const { EventEmitter } = require('events')
const Wit = require('../web-apis/Wit')
const { Timeouts, Paths } = require('../config')

/**
 * Uses Snowboy and Wit.ai for hotword speech detection, triggering a callback whenever it finishes.
 *
 * @param {import('./MemberClient')} memberClient The memberClient of the member this SnowClient is associated with.
 * @param {String} sensitivity The sensitivity of the model.
 */
function SnowClient (memberClient, sensitivity) {
  /**
   * The memberClient this SnowClient is associated with.
   * @type {import('./MemberClient')}
   */
  this.memberClient = memberClient

  /**
   * The Readable stream to read audio data from.
   * @type {Readable}
   */
  this.stream = null

  /**
   * Whether the SnowClient is currently processing a hotword.
   * @type {Boolean}
   */
  this.triggered = false

  /**
   * The time since the last chunk of audio was read from the stream.
   * @type {Number}
   */
  this.lastChunkTime = 0

  const models = new Models()
  models.add({
    file: Paths.defaultResdir + '/snowboy.umdl',
    sensitivity: sensitivity ? '0.45' : sensitivity,
    hotwords: 'snowboy'
  })

  /**
   * The Snowboy detector for hotword detection.
   * @type {Detector}
   */
  this.detector = new Detector({
    resource: Paths.defaultResdir + '/common.res',
    models: models,
    audioGain: 2.0,
    language: 'en-US'
  })

  this.detector.on('hotword', (index, hotword, buffer) => { this.hotword(index, hotword, buffer) })
}

SnowClient.prototype = Object.create(EventEmitter.prototype)
SnowClient.prototype.constructor = SnowClient

/**
 * Triggered whenever a hotword is detected.
 *
 * @param {Number} index The index of the hotword within the model. Always '0'.
 * @param {String} hotword The hotword detected. Always 'Snowboy'.
 * @param {Buffer} buffer Unused parameter.
 */
SnowClient.prototype.hotword = function (index, hotword, buffer) {
  // If already triggered, emit the 'busy' event
  if (this.triggered) {
    this.memberClient.logger.trace('Emitted busy event')
    this.memberClient.logger.debug('Already processing query, rejected hotword trigger')
    this.emit('busy', this.memberClient)
    return
  }
  // Emit the 'hotword' event and set the lastChunkTime and initialTime values
  this.memberClient.logger.trace('Emitted hotword event')
  this.emit('hotword', index, hotword, this.memberClient)
  this.lastChunkTime = Date.now()
  const initialTime = this.lastChunkTime

  function checkBuffer (chunk) {
    if (this.triggered) {
      this.lastChunkTime = Date.now()
    }
  }

  const dataListener = checkBuffer.bind(this)

  const flag = new EventEmitter()
  // Get the text of the audio stream from Wit.ai
  Wit.getStreamText(this.stream, flag).then(finalResult => {
    this.triggered = false
    this.memberClient.logger.trace('Emitted result event')
    this.memberClient.logger.debug('Received result')
    this.memberClient.logger.debug(finalResult)
    this.emit('result', finalResult, this.memberClient)
  }).catch((error) => {
    this.triggered = false
    this.memberClient.logger.trace('Emitted error event')
    this.memberClient.logger.warn('Wit.ai failed')
    this.memberClient.logger.warn(error)
    this.emit('error', error, this.memberClient)
  })

  // Every 50ms, check if the query time has been exceeded or enough silence has elapsed, and finish if it has
  const intervalID = this.memberClient.member.client.setInterval(() => {
    if (Date.now() - this.lastChunkTime > Timeouts.SILENCE_QUERY_TIME || Date.now() - initialTime > Timeouts.MAX_QUERY_TIME) {
      this.memberClient.member.client.clearInterval(intervalID)
      flag.emit('finish')
      this.stream.removeListener('data', dataListener)
      this.triggered = false
      this.memberClient.logger.info('Finished query')
    }
  }, 50)

  this.stream.on('data', dataListener)
  this.triggered = true
}

/**
 * Starts detection, reading from the passed stream
 *
 * @param {ReadableStream} strm The stream to read from for audio.
 */
SnowClient.prototype.start = function (strm) {
  this.memberClient.logger.info('Starting up SnowClient')
  this.stream = strm
  this.stream.pipe(this.detector)
}

/**
 * Shuts down the stream and cleans up all resources.
 */
SnowClient.prototype.stop = function () {
  this.memberClient.logger.info('Shutting down SnowClient')
  if (!this.stream) return
  this.stream.end()
  this.stream.unpipe(this.detector)
  this.stream.destroy()
  this.stream = null
}

module.exports = SnowClient
