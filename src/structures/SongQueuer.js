const { Emojis } = require('../config')
const Embeds = require('../bot-util/Embeds')
const Youtube = require('../bot-util/Youtube')
const YtdlDiscord = require('ytdl-core-discord')

/**
 * Handles all youtube-related and queue-related operations.
 *
 * @param {import('./GuildPlayer')} player The GuildPlayer the queue is for.
 */
function SongQueuer (player) {
  /**
   * The backing GuildPlayer.
   * @type {import('./GuildPlayer')}
   */
  this.player = player

  /**
   * The backing GuildClient.
   * @type {import('./GuildClient')}
   */
  this.guildClient = player.guildClient

  /**
   * Whether a video is being downloaded or not.
   * @type {Boolean}
   */
  this.downloading = false

  /**
   * Whether a song is currently playing or not.
   * @type {Boolean}
   */
  this.playing = false

  /**
   * The logger to use for logging.
   * @type {import('pino')}
   */
  this.logger = player.logger

  /**
   * The active VoiceConnection.
   * @type {import('discord.js').VoiceConnection}
   */
  Object.defineProperty(this, 'connection', {
    get: () => this.player.connection
  })
}

SongQueuer.prototype = Object.create(Array.prototype)

/**
 * Plays a song from the queue.
 *
 * @param {Object} video The videoConstruct object representing the video.
 */
SongQueuer.prototype.play = function (video) {
  // If no video or no connection, clean up connection and begin expiration timeout
  if (!video || !this.connection) {
    this.logger.info('Reached end of current song queue/disconnected')
    this.cleanUp()
    return
  }

  // Uses ytdl-core-discord
  this.logger.info('Attempting to download from %s', video.url)
  this.downloading = true
  YtdlDiscord(video.url).then(stream => {
    this.logger.debug('Successfully downloaded video, attempting to play audio')
    this.downloading = false

    if (this.connection) {
      this.logger.trace('Playing audio')
      this.playing = true
      this.player.play(stream, () => {
        this.logger.info('Finished song')
        this.playing = false
        this.downloading = false
        this.play(this.next())
      }, { type: 'opus', highWaterMark: 50 })

      // Sends a message detailing the currently playing video
      video.channel = `${Emojis.playing} Now Playing! - ${video.channel}`
      video.position = 0
      this.guildClient.sendMsg(
        Embeds.createVideoEmbed(video)
      )
    }
  })
}

/**
 * Queues a song up for playback.
 *
 * @param {Object} video The videoConstruct object of the video.
 * @param {String} query The search term used for the video.
 * @param {import('discord.js').TextChannel?} channel The TextChannel to notify through.
 */
SongQueuer.prototype.queue = async function (video, query, channel) {
  if (!video) {
    this.logger.info('No video results found')
    this.guildClient.sendMsg(
      `${Emojis.sad} ***Could not find any results for \`${query}\`!***`,
      channel
    )
    return
  }
  // Ensure URL is accessible
  try {
    await YtdlDiscord.getBasicInfo(video.url)
  } catch (error) {
    return
  }

  this.push(video)

  // If not playing anything, play this song
  if (!this.playing && !this.downloading) {
    this.logger.info('Playing %s', video.url)
    this.play(video)
  // If playing something, just say it's queued
  } else {
    this.logger.info('Queued %s', video.url)
    if (video.description) {
      video.channel = `${Emojis.queue} Queued! - ${video.channel}`
      this.guildClient.sendMsg(
        Embeds.createVideoEmbed(video),
        channel
      )
    }
  }
}

/**
 * Searches and queues up a query.
 *
 * @param {String} query The search term to search for.
 * @param {String} requester The name of the requester.
 * @param {import('discord.js').TextChannel?} channel The TextChannel to notify through.
 */
SongQueuer.prototype.search = function (query, requester, channel) {
  Youtube.search(query, requester, this.guildClient).then(vid => {
    if (!vid) {
      this.guildClient.sendMsg(`${Emojis.error} ***No results found for ${query}***`, channel)
      return
    }
    if (vid.playlist) {
      vid.forEach(val => {
        this.logger.debug('Adding %s to queue', val.url)
        this.queue(val, query, channel)
      })
    } else {
      this.logger.debug('Adding %s to queue', vid.url)
      this.queue(vid, query, channel)
    }
  })
}

/**
 * Returns the next song in the queue
 *
 * Also handles all looping operations.
 *
 * @returns {Object} Returns the next object in the queue.
 */
SongQueuer.prototype.next = function () {
  switch (this.guildClient.loopState) {
    case 0:
      this.logger.info('Moving to next song in queue')
      this.shift()
      break
    case 1:
      this.logger.info('Looping song')
      break
    case 2:
      this.logger.info('Moving to next song in looped queue')
      this.push(this.shift())
      break
    default:
      throw new Error(`Unhandled loopstate ${this.guildClient.loopState}!`)
  }

  // First item in queue should always correspond to currently playing song.
  return this[0]
}

/**
 * Clears the backing array data.
 */
SongQueuer.prototype.clear = function () {
  this.splice(0, this.length)
}

/**
 * Pushes an item into the queue while also settings its position.
 *
 * @param {Object} item The item to push into the queue.
 */
SongQueuer.prototype.push = function (item) {
  item.position = this.length
  Array.prototype.push.call(this, item)
}

/**
 * Clears the backing array data and stops playing.
 */
SongQueuer.prototype.cleanUp = function () {
  this.clear()
  this.downloading = false
  this.playing = false
  this.guildClient.startTimeout()
  if (this.connection) this.player.idle()
}

module.exports = SongQueuer
