const { Emojis } = require('../config')
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
  this.player = player
  this.guildClient = player.guildClient
  this.logger = player.logger
}

YtQueuer.prototype = Object.create(Array.prototype)

/**
 * Plays a song from the queue.
 *
 * @param {Object} video The videoConstruct object representing the video.
 */
YtQueuer.prototype.queuedPlay = function (video) {
  // If no video, clean up connection and begin expiration timeout
  if (!video) {
    this.logger.info('Reached end of current song queue')
    // End current dispatcher
    if (this.guildClient.playing) this.player.end()
    this.guildClient.playing = false
    this.guildClient.startTimeout()
    return
  }

  // Uses ytdl-core-discord
  this.logger.info('Attempting to download from %s', video.url)
  this.guildClient.downloading = true
  YtdlDiscord(video.url).then(stream => {
    this.logger.debug('Successfully downloaded video, attempting to play audio')
    if (!this.guildClient.connection) {
      this.logger.debug('GuildClient no longer connected, returning')
      this.guildClient.downloading = false
      this.guildClient.playing = false
      stream.destroy()
      return
    }
    this.guildClient.downloading = false
    this.guildClient.playing = true
    const dispatcher = this.guildClient.connection.play(stream, {
      type: 'opus',
      highWaterMark: 50
    })
      .on('finish', () => {
        // Cleans up stream and dispatcher
        this.logger.info('Finished song')
        this.guildClient.playing = false
        this.guildClient.downloading = false
        dispatcher.destroy()
        stream.destroy()
        this.queuedPlay(this.player.next())
      })
  }).catch('error', error => {
    // Uh oh
    this.logger.error('Youtube error')
    this.guildClient.sendMsg(`${Emojis.error} ***Sorry, an error occurred on playback!***`)
    throw error
  })

  // Sends a message detailing the currently playing video
  video.channel = `${Emojis.playing} Now Playing! - ${video.channel}`
  this.guildClient.sendMsg(
    Embeds.createVideoEmbed(video)
  )
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
  this.player.queue(video)

  // If not playing anything, play this song
  if (!this.guildClient.playing && !this.guildClient.downloading) {
    this.logger.info('Playing %s', video.url)
    this.queuedPlay(video)
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
  let result
  // Attempt to get result from Youtube
  try {
    result = await Ytsearch(query)
  } catch (error) {
    this.logger.error('Error while searching YouTube')
    throw error
  }

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
  let result
  // Attempt to get info from url
  try {
    result = await YtdlDiscord.getBasicInfo(url)
  } catch (error) {
    return
  }

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
    Ytpl(query, { limit: 0 }).then(result => {
      const name = result.title
      const vids = result.items
      this.guildClient.sendMsg(
        `${Emojis.checkmark} **Adding \`${vids.length}\` videos from \`${name}\`**`
      )

      vids.forEach(vid => {
        this.logger.info('Adding %s to queue as playlist item', vid.url_simple)
        this.queue(requester,
          {
            url: vid.url_simple,
            title: vid.title,
            channel: vid.author.name,
            thumbnail: vid.thumbnail,
            duration: vid.duration
          },
          query
        )
      })
    })
  // Directly get info from URL
  } else if (YtdlDiscord.validateURL(query)) {
    this.guildClient.sendMsg(
      `${Emojis.search} ***Searching for*** \`${query}\``
    )
    this.urlSearch(query).then(video => {
      this.queue(requester, video, query)
    })
  // Search query from Youtube
  } else {
    this.guildClient.sendMsg(
      `${Emojis.search} ***Searching for*** \`${query}\``
    )
    this.querySearch(query).then(video => {
      this.queue(requester, video, query)
    })
  }
}

module.exports = YtQueuer
