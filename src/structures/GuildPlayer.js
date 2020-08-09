const Streams = require('./Streams')
const Resampler = require('node-libsamplerate')
const YtQueuer = require('./YtQueuer')

/**
 * Handles all playback-related operations for a GuildClient.
 *
 * @param {import('./GuildClient')} guildClient The GuildClient to handle.
 */
function GuildPlayer (guildClient) {
  /**
   * The corresponding GuildClient.
   * @type {import('./GuildClient')}
   */
  this.guildClient = guildClient

  /**
   * The current VoiceConnection.
   * @type {import('discord.js').VoiceConnection}
   */
  this.connection = null

  /**
   * The logger to use for logging.
   * @type {import('pino')}
   */
  this.logger = guildClient.logger

  /**
   * The array of videos queued for playback.
   * @type {YtQueuer}
   */
  this.queuer = new YtQueuer(this)

  guildClient.on('connected', result => {
    this.logger.debug('Received GuildClient#connected event')
    this.connection = result.connection
    this.idle()
  })

  guildClient.on('disconnected', () => {
    this.logger.debug('Received GuildClient#disconnected event')
    if (this.connection.dispatcher) {
      this.clearQueue()
      this.end()
    }
    this.logger.trace('Disconnecting')
    this.connection.disconnect()
    this.connection = null
  })
}

/**
 * Ends the current playback and clears the queue.
 */
GuildPlayer.prototype.stop = function () {
  this.logger.debug('Ending dispatcher')
  this.clearQueue()
  this.end()
  this.idle()
}

/**
 * Ends the current playback.
 */
GuildPlayer.prototype.end = function () {
  this.logger.debug('Ending dispatcher')
  this.connection.dispatcher.end()
}

/**
 * Pauses the current playback.
 */
GuildPlayer.prototype.pause = function () {
  this.logger.debug('Pausing dispatcher')
  this.connection.dispatcher.pause()
}

/**
 * Resumes the current playback.
 */
GuildPlayer.prototype.resume = function () {
  this.logger.debug('Resuming dispatcher')
  this.connection.dispatcher.resume()
}

/**
 * Clears the song queue.
 */
GuildPlayer.prototype.clearQueue = function () {
  this.logger.debug('Clearing song queue')
  this.queuer = new YtQueuer(this)
}

/**
 * Adds an object to the queue.
 *
 * @param {Object} item The object to push.
 */
GuildPlayer.prototype.queue = function (item) {
  this.logger.debug('Pushing item %o into queue', item)
  item.position = this.queuer.length
  this.queuer.push(item)
}

/**
 * Returns the next song in the queue
 *
 * Also handles all looping operations.
 *
 * @returns {Object} Returns the next object in the queue.
 */
GuildPlayer.prototype.next = function () {
  switch (this.guildClient.loopState) {
    case 0:
      this.logger.info('Moving to next song in queue')
      this.queuer.shift()
      break
    case 1:
      this.logger.info('Looping song')
      break
    case 2:
      this.logger.info('Moving to next song in looped queue')
      this.queue(this.queuer.shift())
      break
    default:
      throw new Error(`Unhandled loopstate ${this.guildClient.loopState}!`)
  }

  return this.queuer[0]
}

/**
 * Creates a processed audio stream listening to a GuildMember.
 *
 * Returned stream is formatted 16kHz, mono, 16-bit, little-endian, signed integers.
 *
 * @param {import('discord.js').GuildMember} member The GuildMember to listen to.
 * @returns {ReadableStream} Returns a stream to read audio data from.
 */
GuildPlayer.prototype.listenTo = function (member) {
  this.logger.debug('Attempting to create audio stream for %s in %s', member.displayName, member.guild.name)
  const audioStream = this.connection.receiver.createStream(member, {
    mode: 'pcm',
    end: 'manual'
  })
  // Turns from stereo to mono
  const transformStream = new Streams.TransformStream()
  // Turns from 48k to 16k
  const resample = new Resampler({
    type: 3,
    channels: 1,
    fromRate: 48000,
    fromDepth: 16,
    toRate: 16000,
    toDepth: 16
  })

  // Ensures proper stream cleanup
  resample.on('close', () => {
    transformStream.removeAllListeners()
    audioStream.removeAllListeners()
    resample.removeAllListeners()
    transformStream.destroy()
    audioStream.destroy()
    resample.destroy()
  })
  return audioStream.pipe(transformStream).pipe(resample)
}

/**
 * Plays silence over the VoiceConnection to await new commands.
 */
GuildPlayer.prototype.idle = function () {
  const silence = new Streams.Silence()
  const dispatcher = this.connection.play(silence, { type: 'opus' })
  dispatcher.on('finish', () => {
    silence.destroy()
    dispatcher.destroy()
  })
}

module.exports = GuildPlayer
