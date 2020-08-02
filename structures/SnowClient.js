const { Models, Detector } = require('snowboy')
const { EventEmitter } = require('events')
const Wit = require('../web-apis/Wit')
const { Timeouts } = require('../config')

/**
 * Uses Snowboy for hotword detection, triggering a callback.
 *
 * @property {ReadableStream} stream The stream to be piped to the detector.
 * @property {boolean} triggered Whether the client is triggered by a hotword currently.
 * @property {Object} memberClient The memberClient of the member this SnowClient is associated with.
 * @property {EventEmitter} events The EventEmitter used for callbacks.
 * @property {Detector} detector The Detector used for Snowboy.
 * @property {Any} logger The logger to use.
 * @property {Number} timeSinceLastChunk The time since the last chunk of data was read from the stream.
 */
class SnowClient {
  /**
   * Initializes the Snowboy detection.
   *
   * @param {Object} memberClient The memberClient of the member this SnowClient is associated with.
   * @param {String} sensitivity The sensitivity of the model.
   */
  constructor (mmbrClnt, sensitivity) {
    this.stream = null
    this.triggered = false
    this.memberClient = mmbrClnt
    this.events = new EventEmitter()

    const models = new Models()
    models.add({
      file: './resources/snowboy.umdl',
      sensitivity: sensitivity ? '0.45' : sensitivity,
      hotwords: 'snowboy'
    })

    this.detector = new Detector({
      resource: './resources/common.res',
      models: models,
      audioGain: 2.0,
      language: 'en-US'
    })

    this.detector.on('hotword', (index, hotword, buffer) => { this.hotword(index, hotword, buffer) })
  }

  /**
   * Sets the logger to use for this SnowClient instance.
   *
   * @param {Any} logger The logger to use.
   */
  setLogger (logger) {
    this.logger = logger
  }

  /**
   * Updates the timeSinceLastChunk property whenever data is received.
   *
   * @private
   * @param {Buffer} chunk The data received from the stream.
   */
  checkBuffer (chunk) {
    if (this.triggered) {
      if (new Date().getTime() - this.timeSinceLastChunk < Timeouts.SILENCE_QUERY_TIME) {
        this.timeSinceLastChunk = new Date().getTime()
      }
    }
  }

  /**
   * Triggered whenever a hotword is detected.
   *
   * @param {Number} index The index of the hotword within the model. Always '0'.
   * @param {String} hotword The hotword detected. Always 'Snowboy'.
   * @param {Buffer} buffer Unused parameter.
   */
  hotword (index, hotword, buffer) {
    // If already triggered, emit the 'busy' event
    if (this.triggered) {
      if (this.logger) {
        this.logger.trace('Emitted busy event')
        this.logger.debug('Already processing query, rejected hotword trigger')
      }
      this.events.emit('busy', this.memberClient)
      return
    }
    // Emit the 'hotword' event and set the timeSinceLastChunk and initialTime values
    if (this.logger) this.logger.trace('Emitted hotword event')
    this.events.emit('hotword', index, hotword, this.memberClient)
    this.timeSinceLastChunk = new Date().getTime()
    const initialTime = this.timeSinceLastChunk

    const flag = new EventEmitter()
    // Get the text of the audio stream from Wit.ai
    Wit.getStreamText(this.stream, flag, (finalResult) => {
      this.triggered = false
      if (this.logger) {
        this.logger.trace('Emitted result event')
        this.logger.debug('Received result')
        this.logger.debug(finalResult)
      }
      this.events.emit('result', finalResult, this.memberClient)
    },
    (error) => {
      this.triggered = false
      if (this.logger) {
        this.logger.trace('Emitted error event')
        this.logger.warn('Wit.ai failed')
        this.logger.warn(error)
      }
      this.events.emit('error', error, this.memberClient)
    })

    // Every 50ms, check if the query time has been exceeded, and finish if it has
    const intervalID = setInterval(() => {
      if (new Date().getTime() - this.timeSinceLastChunk > Timeouts.SILENCE_QUERY_TIME || new Date().getTime() - initialTime > Timeouts.MAX_QUERY_TIME) {
        clearInterval(intervalID)
        flag.emit('finish')
        this.stream.removeAllListeners()
        this.stream.pipe(this.detector)
        this.triggered = false
        if (this.logger) this.logger.info('Finished query')
      }
    }, 50)

    this.stream.on('data', chunk => this.checkBuffer(chunk))
    this.triggered = true
  }

  /**
   * Adds a callback for an event.
   *
   * @param {String} event The event to add the callback to.
   * @param {Function} callback The function to be called whenever that event is emitted.
   */
  on (event, callback) {
    this.events.on(event, callback)
  }

  /**
   * Starts detection, reading from the passed stream
   *
   * @param {ReadableStream} strm The stream to read from for audio.
   */
  start (strm) {
    if (this.logger) this.logger.info('Starting up SnowClient')
    this.stream = strm
    this.stream.pipe(this.detector)
  }

  /**
   * Shuts down the stream and cleans up all resources.
   */
  stop () {
    if (this.logger) this.logger.info('Shutting down SnowClient')
    if (!this.stream) return
    this.stream.end()
    this.stream.unpipe(this.detector)
    this.stream.removeAllListeners()
    this.stream.destroy()
    this.stream = null
  }
}

module.exports = SnowClient