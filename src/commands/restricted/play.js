const { Emojis } = require('../../config')
const Embeds = require('../../bot-util/Embeds')
const YtdlDiscord = require('ytdl-core-discord')
const Ytpl = require('ytpl')
const Ytsearch = require('yt-search')

/**
 * Plays a song from the queue.
 *
 * @param {Object} video The videoConstruct object representing the video.
 * @param {import('../../structures/GuildClient')} guildClient The guildClient associated with the server of the playback.
 */
function queuedPlay (video, guildClient) {
  const logger = guildClient.logger
  // If no video, clean up connection and begin expiration timeout
  if (!video) {
    logger.info('Reached end of current song queue')
    // End current dispatcher
    if (guildClient.playing) guildClient.guildPlayer.end()
    guildClient.playing = false
    guildClient.startTimeout()
    return
  }

  // Uses ytdl-core-discord
  logger.info('Attempting to download from %s', video.url)
  guildClient.downloading = true
  YtdlDiscord(video.url).then(stream => {
    logger.debug('Successfully downloaded video, attempting to play audio')
    if (!guildClient.connected) {
      logger.debug('GuildClient no longer connected, returning')
      guildClient.downloading = false
      guildClient.playing = false
      stream.destroy()
      return
    }
    guildClient.downloading = false
    guildClient.playing = true
    const dispatcher = guildClient.guildPlayer.connection.play(stream, {
      type: 'opus',
      highWaterMark: 50
    })
      .on('finish', () => {
        // Cleans up stream and dispatcher
        logger.info('Finished song')
        guildClient.playing = false
        guildClient.downloading = false
        dispatcher.destroy()
        stream.destroy()
        queuedPlay(guildClient.guildPlayer.next(), guildClient)
      })
  }).catch('error', error => {
    // Uh oh
    logger.error('Youtube error')
    guildClient.sendMsg(`${Emojis.error} ***Sorry, an error occurred on playback!***`)
    throw error
  })

  // Sends a message detailing the currently playing video
  const mmbr = guildClient.memberClients.get(video.requester)
  if (!mmbr) {
    logger.warn('No user found for ID %s!', video.requester)
    return
  }
  video.channel = `${Emojis.playing} Now Playing! - ${video.channel}`
  video.position = 'Now!'
  guildClient.sendMsg(
    Embeds.createVideoEmbed(video, mmbr.member.displayName)
  )
}

/**
 * Queues a song up for playback.
 *
 * @param {import('../../structures/MemberClient')} memberClient The memberClient of the member who requested the song.
 * @param {Object} video The videoConstruct object of the video.
 */
async function queue (memberClient, video, query) {
  const logger = memberClient.logger
  if (!video) {
    logger.info('No video results found')
    memberClient.guildClient.sendMsg(
      `${Emojis.sad} ***Could not find any results for \`${query}\`!***`
    )
    return
  }
  video.requester = memberClient.id
  memberClient.guildClient.guildPlayer.queue(video)

  // If not playing anything, play this song
  if (!memberClient.guildClient.playing && !memberClient.guildClient.downloading) {
    logger.info('Playing %s', video.url)
    queuedPlay(video, memberClient.guildClient)
  // If playing something, just say it's queued
  } else {
    logger.info('Queued %s', video.url)
    if (video.description) {
      video.channel = `${Emojis.queue} Queued! - ${video.channel}`
      video.position = memberClient.guildClient.guildPlayer.songQueueLength - 1
      memberClient.guildClient.sendMsg(
        Embeds.createVideoEmbed(video, memberClient.member.displayName)
      )
    }
  }
}

/**
 * Searches YouTube for videos from a query.
 *
 * @param {String} query The search query.
 * @param {import('pino')} logger The logger for logging.
 * @returns {Object} A videoConstruct if a result is found, else null
 */
async function querySearch (query, logger) {
  logger.info('Searching query %s', query)
  let result
  // Attempt to get result from Youtube
  try {
    result = await Ytsearch(query)
  } catch (error) {
    logger.error('Error while searching YouTube')
    throw error
  }

  if (!result.videos || !result.videos[0]) {
    logger.debug('No results found for %s', query)
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
    thumbnail: topResult.thumbnail,
    duration: topResult.timestamp
  }
  return videoConstruct
}

/**
 * Searches YouTube for videos from a URL.
 *
 * @param {String} url The URL.
 * @param {import('pino')} logger The logger for logging.
 * @returns {Object} A videoConstruct if a result is found, else null
 */
async function urlSearch (url, logger) {
  logger.info('Searching URL %s', url)
  let result
  // Attempt to get info from url
  try {
    result = await YtdlDiscord.getBasicInfo(url)
  } catch (error) {
    return
  }

  if (!result || result.player_response.videoDetails.isPrivate) {
    logger.debug('No info found for %s', url)
    return
  }

  logger.debug('Successfully received results from URL')
  logger.debug(result)
  const topResult = result.player_response.videoDetails
  // Truncates description
  let description = topResult.shortDescription.length > 122 ? topResult.shortDescription.substr(0, 122) + '...' : topResult.shortDescription
  description = description.replace(/\n/gi, ' ')
  const duration = Math.floor(topResult.lengthSeconds / 60) + ':' + topResult.lengthSeconds % 60
  console.log(duration)
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
 * Plays or queues a song or playlist.
 *
 * @param {import('../../structures/MemberClient')} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args The search query for the song.
 */
function play (memberClient, args) {
  const logger = memberClient.logger
  logger.info('Received play command')
  // If not connected, notify and return
  if (!memberClient.guildClient.connected) {
    logger.debug('Not connected to a voice channel')
    memberClient.guildClient.sendMsg(
      `${Emojis.error} ***I am not in a voice channel!***`
    )
    return
  }

  // If no query, notify and return
  if (!args || args.length === 0) {
    logger.debug('No query found')
    memberClient.guildClient.sendMsg(
      `${Emojis.error} ***I need something to play!***`
    )
    return
  }

  const query = args.join(' ')
  logger.debug('Searching up %s', query)

  // Add each video from Youtube playlist
  if (Ytpl.validateURL(args[0])) {
    memberClient.guildClient.sendMsg(
      `${Emojis.search} ***Searching for*** \`${args[0]}\``
    )
    Ytpl(args[0], { limit: 0 }).then(result => {
      const name = result.title
      const vids = result.items
      memberClient.guildClient.sendMsg(
        `${Emojis.checkmark} **Adding \`${vids.length}\` videos from \`${name}\`**`
      )

      vids.forEach(vid => {
        logger.info('Adding %s to queue as playlist item', vid.url_simple)
        queue(memberClient, {
          url: vid.url_simple,
          title: vid.title,
          channel: vid.author.name,
          thumbnail: vid.thumbnail,
          duration: vid.duration
        })
      })
    })
  // Directly get info from URL
  } else if (YtdlDiscord.validateURL(args[0])) {
    memberClient.guildClient.sendMsg(
      `${Emojis.search} ***Searching for*** \`${args[0]}\``
    )
    urlSearch(args[0], logger).then(video => {
      queue(memberClient, video, args[0])
    })
  // Search query from Youtube
  } else {
    memberClient.guildClient.sendMsg(
      `${Emojis.search} ***Searching for*** \`${query}\``
    )
    querySearch(query, logger).then(video => {
      queue(memberClient, video, query)
    })
  }
}

module.exports = {
  name: 'play',
  execute: play
}
