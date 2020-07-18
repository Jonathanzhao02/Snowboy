const Detector = require('snowboy').Detector
const Models = require('snowboy').Models
const Events = require('events')
const wit = require('./wit')

const MAX_QUERY_TIME = 8000
const SILENCE_QUERY_TIME = 2500

class SnowClient {
  constructor (gldClnt, usrId, sensitivity) {
    this.stream = null
    this.triggered = false
    this.guildClient = gldClnt
    this.userId = usrId
    this.events = new Events.EventEmitter()

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

    this.detector.on('silence', function () {
      // console.log('silent')
    })

    this.detector.on('sound', function (buffer) {
      // console.log('sound')
    })

    this.detector.on('error', function () {
      console.log('error')
    })

    this.detector.on('hotword', (index, hotword, buffer) => { this.hotword(index, hotword, buffer) })
  }

  fillBuffer (chunk) {
    if (this.triggered) {
      if (new Date().getTime() - this.timeSinceLastChunk < SILENCE_QUERY_TIME) {
        this.timeSinceLastChunk = new Date().getTime()
        // this.bufs.push(chunk)
      }
    }
  }

  hotword (index, hotword, buffer) {
    if (this.triggered) {
      this.events.emit('busy', this.guildClient, this.userId)
      return
    }
    this.events.emit('hotword', index, hotword, this.guildClient, this.userId)
    this.timeSinceLastChunk = new Date().getTime()
    const initialTime = this.timeSinceLastChunk

    const flag = new Events.EventEmitter()
    wit.getStreamText(this.stream, flag, (finalResult) => {
      this.triggered = false
      this.events.emit('result', finalResult, this.guildClient, this.userId)
    },
    (error) => {
      this.triggered = false
      this.events.emit('error', error, this.guildClient, this.userId)
    })

    const intervalID = setInterval(() => {
      if (new Date().getTime() - this.timeSinceLastChunk > SILENCE_QUERY_TIME || new Date().getTime() - initialTime > MAX_QUERY_TIME) {
        clearInterval(intervalID)
        flag.emit('finish')
        this.stream.removeAllListeners()
        this.stream.pipe(this.detector)
        this.triggered = false
        console.log('Finished query')
      }
    }, 50)

    this.stream.on('data', chunk => this.fillBuffer(chunk))
    this.triggered = true
  }

  on (event, callback) {
    this.events.on(event, callback)
  }

  start (strm) {
    this.stream = strm
    console.log(`SNOWBOY: Listening to ${this.userId}...`)
    this.stream.pipe(this.detector)
  }

  stop () {
    console.log(`SNOWBOY: Shutting down ${this.userId}...`)

    if (!this.stream) return

    this.stream.unpipe(this.detector)
    this.stream.removeAllListeners()
    this.stream.end()
    this.stream.destroy()
  }
}

exports.SnowClient = SnowClient
