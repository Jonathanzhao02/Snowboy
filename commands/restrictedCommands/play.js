const Common = require('../../common')
const Emojis = require('../../emojis')
const { Embeds, Functions } = require('../../bot-util')

const Config = require('../../config')
const YtdlDiscord = require('ytdl-core-discord')
const Ytpl = require('ytpl')
const Ytsearch = require('yt-search')

/**
 * Plays a song from the queue.
 *
 * @param {Object} video The videoConstruct object representing the video.
 * @param {Object} guildClient The guildClient associated with the server of the playback.
 */
function queuedPlay (video, guildClient) {
  const logger = guildClient.logger
  // If no video, clean up connection and begin expiration timeout
  if (!video) {
    logger.info('Reached end of current song queue')
    // End current dispatcher
    if (guildClient.playing) guildClient.connection.dispatcher.end()
    Functions.playSilence(guildClient)
    guildClient.playing = false
    guildClient.lastCalled = Date.now()
    logger.debug('Starting expiration timer')
    setTimeout(() => {
      Functions.cleanupGuildClient(guildClient, Common.botClient)
    }, Config.TIMEOUT + 500)
    return
  }

  // Uses ytdl-core-discord
  logger.info(`Attempting to download from ${video.url}`)
  guildClient.downloading = true
  YtdlDiscord(video.url).then(stream => {
    logger.debug('Successfully downloaded video, playing audio')
    guildClient.downloading = false
    guildClient.playing = true
    const dispatcher = guildClient.connection.play(stream, {
      type: 'opus',
      highWaterMark: 50
    })
      .on('finish', () => {
        // Cleans up stream and dispatcher
        logger.info('Finished song')
        var queue = guildClient.songQueue
        guildClient.playing = false
        dispatcher.destroy()
        stream.destroy()

        // Goes to next song in queue
        if (guildClient.connection) {
          if (guildClient.loopState === 0) {
            logger.info('Moving to next song in queue')
            queue.shift()
            queuedPlay(queue[0], guildClient)
          } else if (guildClient.loopState === 1) {
            logger.info('Looping song')
            queuedPlay(queue[0], guildClient)
          } else if (guildClient.loopState === 2) {
            logger.info('Moving to next song in looped queue')
            queue.push(queue.shift())
            queuedPlay(queue[0], guildClient)
          }
        }
      })
  }).catch('error', error => {
    // Uh oh
    logger.error('Youtube error')
    Functions.sendMsg(guildClient.textChannel, `${Emojis.error} ***Sorry, an error occurred on playback!***`, guildClient)
    throw error
  })

  // Sends a message detailing the currently playing video
  guildClient.guild.members.fetch(video.requester)
    .then(async member => {
      // Fill in video details if only the URL was queued
      if (!video.title) {
        logger.info(`Searching missing info for ${video.url}`)
        try {
          const result = await urlSearch(video.url, logger)
          if (!result) {
            logger.debug(`No results found for ${video.url}`)
            Functions.sendMsg(guildClient.textChannel, `${Emojis.sad} ***Could not play \`${video.url}\`***`, guildClient)
            return
          }
          video = result
        } catch (error) {
          logger.error(`Error while searching for ${video.url}`)
          Functions.sendMsg(guildClient.textChannel, `${Emojis.error} ***Sorry, an error occurred on playback!***`, guildClient)
          throw error
        }
      }
      video.channel = `${Emojis.playing} Now Playing! - ${video.channel}`
      Functions.sendMsg(guildClient.textChannel,
        Embeds.createVideoEmbed(video, member.displayName),
        guildClient)
    })
}

/**
 * Queues a song up for playback.
 *
 * @param {Object} guildClient The guildClient of the server of the queue.
 * @param {String} userId The ID of the user who requested the song.
 * @param {Object} video The videoConstruct object of the video.
 */
async function queue (guildClient, userId, video, query) {
  const logger = guildClient.logger
  if (!video) {
    logger.info('No video results found')
    Functions.sendMsg(guildClient.textChannel, `${Emojis.sad} ***Could not find any results for \`${query}\`!***`, guildClient)
    return
  }
  video.requester = userId
  guildClient.songQueue.push(video)

  // If not playing anything, play this song
  if (!guildClient.playing && !guildClient.downloading) {
    logger.info(`Playing ${video}`)
    queuedPlay(video, guildClient)
  // If playing something, just say it's queued
  } else {
    logger.info(`Queued ${video}`)
    if (video.title) {
      const member = await guildClient.guild.members.fetch(userId)
      if (!member) {
        logger.warn(`No user found for ID ${userId}!`)
        return
      }
      video.channel = `${Emojis.queue} Queued! - ${video.channel}`
      Functions.sendMsg(guildClient.textChannel,
        Embeds.createVideoEmbed(video, member.displayName),
        guildClient)
    }
  }
}

/**
 * Searches YouTube for videos from a query.
 *
 * @param {String} query The search query.
 * @param {Object} logger The logger for logging.
 */
async function querySearch (query, logger) {
  logger.info(`Searching query ${query}`)
  let result
  // Attempt to get result from Youtube
  try {
    result = await Ytsearch(query)
  } catch (error) {
    logger.error('Error while searching YouTube')
    throw error
  }

  if (!result.videos || !result.videos[0]) {
    logger.debug(`No results found for ${query}`)
    return
  }

  logger.debug('Successfully received results for query')
  logger.debug(result)
  const topResult = result.videos[0]
  // Modifies properties to allow better context within functions
  const videoConstruct = {
    url: topResult.url,
    title: topResult.title,
    channel: topResult.author.name,
    description: topResult.description,
    thumbnail: topResult.thumbnail
  }
  return videoConstruct
}

/**
 * Searches YouTube for videos from a URL.
 *
 * @param {String} url The URL.
 * @param {Object} logger The logger for logging.
 */
async function urlSearch (url, logger) {
  logger.info(`Searching URL ${url}`)
  let result
  // Attempt to get info from url
  try {
    result = await YtdlDiscord.getBasicInfo(url)
  } catch (error) {
    return
  }

  if (!result || result.player_response.videoDetails.isPrivate) {
    logger.debug(`No info found for ${url}`)
    return
  }

  logger.debug('Successfully received results from URL')
  logger.debug(result)
  const topResult = result.player_response.videoDetails
  // Truncates description
  let description = topResult.shortDescription.length > 122 ? topResult.shortDescription.substr(0, 122) + '...' : topResult.shortDescription
  description = description.replace(/\n/gi, ' ')
  // Modifies properties to allow better context within functions
  const videoConstruct = {
    url: 'https://www.youtube.com/watch?v=' + topResult.videoId,
    title: topResult.title,
    channel: topResult.author,
    description: description,
    thumbnail: topResult.thumbnail.thumbnails[0].url
  }
  return videoConstruct
}

/**
 * Plays or queues a song or playlist.
 *
 * @param {Object} guildClient The guildClient of the user's server.
 * @param {String} userId The ID of the user requesting a song.
 * @param {String[]} args The search query for the song.
 */
function play (guildClient, userId, args) {
  const logger = guildClient.logger.child({ user: userId })
  logger.info('Received play command')
  // If not connected, notify and return
  if (!guildClient.connection) {
    logger.debug('Not connected to a voice channel')
    Functions.sendMsg(guildClient.textChannel, `${Emojis.error} ***I am not in a voice channel!***`, guildClient)
    return
  }

  // If no query, notify and return
  if (!args || args.length === 0) {
    logger.debug('No query found')
    Functions.sendMsg(guildClient.textChannel, `${Emojis.error} ***I need something to play!***`, guildClient)
    return
  }

  const query = args.join(' ')
  logger.debug(`Searching up ${query}`)

  // Add each video from Youtube playlist
  if (Ytpl.validateURL(args[0])) {
    Functions.sendMsg(guildClient.textChannel, `${Emojis.search} ***Searching for*** \`${args[0]}\``, guildClient)
    Ytpl(args[0], { limit: 0 }).then(result => {
      const name = result.title
      const vids = result.items
      Functions.sendMsg(guildClient.textChannel, `${Emojis.checkmark} **Adding \`${vids.length}\` videos from \`${name}\`**`, guildClient)

      vids.forEach(vid => {
        logger.info(`Adding ${vid.url_simple} to queue as playlist item`)
        queue(guildClient, userId, { url: vid.url_simple })
      })
    })
  // Directly get info from URL
  } else if (YtdlDiscord.validateURL(args[0])) {
    Functions.sendMsg(guildClient.textChannel, `${Emojis.search} ***Searching for*** \`${args[0]}\``, guildClient)
    urlSearch(args[0], logger).then(video => {
      queue(guildClient, userId, video, args[0])
    })
  // Search query from Youtube
  } else {
    Functions.sendMsg(guildClient.textChannel, `${Emojis.search} ***Searching for*** \`${query}\``, guildClient)
    querySearch(query, logger).then(video => {
      queue(guildClient, userId, video, query)
    })
  }
}

module.exports = {
  name: 'play',
  execute: play
}
