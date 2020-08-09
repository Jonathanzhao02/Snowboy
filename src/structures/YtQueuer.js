const { Emojis, MAX_SONGS } = require('../config')
const Embeds = require('../bot-util/Embeds')
const YtdlDiscord = require('ytdl-core-discord')
const Ytpl = require('ytpl')
const Ytsearch = require('yt-search')

/**
 * Handles all youtube-related and queue-related operations.
 *
 * @param {import('./GuildPlayer')} player The GuildPlayer the queue is for.
 */
function YtQueuer (player) {
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

YtQueuer.prototype = Object.create(Array.prototype)

/**
 * Plays a song from the queue.
 *
 * @param {Object} video The videoConstruct object representing the video.
 */
YtQueuer.prototype.play = function (video) {
  // If no video or no connection, clean up connection and begin expiration timeout
  if (!video || !this.connection) {
    this.logger.info('Reached end of current song queue')
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
 * @param {String} requester The name of the requester.
 * @param {Object} video The videoConstruct object of the video.
 * @param {String} query The search term used for the video.
 */
YtQueuer.prototype.queue = async function (requester, video, query) {
  if (!video) {
    this.logger.info('No video results found')
    this.guildClient.sendMsg(
      `${Emojis.sad} ***Could not find any results for \`${query}\`!***`
    )
    return
  }
  video.requester = requester
  this.push(video)

  // If not playing anything, play this song
  if (!this.guildClient.playing && !this.downloading) {
    this.logger.info('Playing %s', video.url)
    this.play(video)
  // If playing something, just say it's queued
  } else {
    this.logger.info('Queued %s', video.url)
    if (video.description) {
      video.channel = `${Emojis.queue} Queued! - ${video.channel}`
      this.guildClient.sendMsg(
        Embeds.createVideoEmbed(video)
      )
    }
  }
}

/**
 * Searches YouTube for videos from a query.
 *
 * @param {String} query The search query.
 * @returns {Object} A videoConstruct if a result is found, else null.
 */
YtQueuer.prototype.querySearch = async function (query) {
  this.logger.info('Searching query %s', query)
  // Attempt to get result from Youtube
  const result = await Ytsearch(query)

  if (!result.videos || !result.videos[0]) {
    this.logger.debug('No results found for %s', query)
    return
  }

  this.logger.debug('Successfully received results for query')
  this.logger.debug(result)
  const topResult = result.videos[0]
  // Modifies properties to allow better context within functions
  const videoConstruct = {
    url: topResult.url,
    title: topResult.title,
    channel: topResult.author.name,
    description: topResult.description,
    thumbnail: topResult.thumbnail,
    duration: topResult.timestamp
  }
  return videoConstruct
}

/**
 * Searches YouTube for videos from a URL.
 *
 * @param {String} url The URL.
 * @returns {Object} A videoConstruct if a result is found, else null.
 */
YtQueuer.prototype.urlSearch = async function (url) {
  this.logger.info('Searching URL %s', url)
  // Attempt to get info from url
  const result = await YtdlDiscord.getBasicInfo(url)

  if (!result || result.player_response.videoDetails.isPrivate) {
    this.logger.debug('No info found for %s', url)
    return
  }

  this.logger.debug('Successfully received results from URL')
  this.logger.debug(result)
  const topResult = result.player_response.videoDetails
  // Truncates description
  let description = topResult.shortDescription.length > 122 ? topResult.shortDescription.substr(0, 122) + '...' : topResult.shortDescription
  description = description.replace(/\n/gi, ' ')
  const duration = Math.floor(topResult.lengthSeconds / 60) + ':' + topResult.lengthSeconds % 60
  // Modifies properties to allow better context within functions
  const videoConstruct = {
    url: 'https://www.youtube.com/watch?v=' + topResult.videoId,
    title: topResult.title,
    channel: topResult.author,
    description: description,
    thumbnail: topResult.thumbnail.thumbnails[0].url,
    duration: duration
  }
  return videoConstruct
}

/**
 * Searches a YouTube playlist and queues songs from it.
 *
 * @param {String} url The playlist URL.
 * @returns {Array} Returns the Array of created video constructs.
 */
YtQueuer.prototype.playlistSearch = async function (url) {
  const result = await Ytpl(url, { limit: MAX_SONGS })
  const name = result.title
  const vids = result.items
  this.guildClient.sendMsg(
    `${Emojis.checkmark} **Adding \`${vids.length}\` videos from \`${name}\`**`
  )

  vids.forEach((vid, index) => {
    vids[index] = {
      url: vid.url_simple,
      title: vid.title,
      channel: vid.author.name,
      thumbnail: vid.thumbnail,
      duration: vid.duration
    }
  })

  return vids
}

/**
 * Searches and queues up a query.
 *
 * @param {String} query The search term to search for.
 * @param {String} requester The name of the requester.
 */
YtQueuer.prototype.search = function (query, requester) {
  // Add each video from Youtube playlist
  if (Ytpl.validateURL(query)) {
    this.guildClient.sendMsg(
      `${Emojis.search} ***Searching for*** \`${query}\``
    )
    this.playlistSearch(query).then(vids => {
      vids.forEach(video => {
        this.logger.info('Adding %s to queue as playlist item', video.url)
        this.queue(requester, video, query)
      })
    })
  // Directly get info from URL
  } else if (YtdlDiscord.validateURL(query)) {
    this.guildClient.sendMsg(
      `${Emojis.search} ***Searching for*** \`${query}\``
    )
    this.urlSearch(query).then(video => {
      this.logger.info('Adding %s to queue', video.url)
      this.queue(requester, video, query)
    })
  // Search query from Youtube
  } else {
    this.guildClient.sendMsg(
      `${Emojis.search} ***Searching for*** \`${query}\``
    )
    this.querySearch(query).then(video => {
      this.logger.info('Adding %s to queue', video.url)
      this.queue(requester, video, query)
    })
  }
}

/**
 * Returns the next song in the queue
 *
 * Also handles all looping operations.
 *
 * @returns {Object} Returns the next object in the queue.
 */
YtQueuer.prototype.next = function () {
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

  return this[0]
}

/**
 * Clears the backing array data.
 */
YtQueuer.prototype.clear = function () {
  this.splice(0, this.length)
}

/**
 * Pushes an item into the queue while also settings its position.
 *
 * @param {Object} item The item to push into the queue.
 */
YtQueuer.prototype.push = function (item) {
  item.position = this.length
  Array.prototype.push.call(this, item)
}

YtQueuer.prototype.cleanUp = function () {
  this.clear()
  this.downloading = false
  this.playing = false
  this.guildClient.startTimeout()
}

module.exports = YtQueuer
