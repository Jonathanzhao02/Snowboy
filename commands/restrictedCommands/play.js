const Common = require('../../common')
const Emojis = require('../../emojis')
const { Embeds, Functions } = require('../../bot-util')

const Config = require('../../config')
const Ytdl = require('ytdl-core-discord')

const YouTube = require('youtube-node')
const youtube = new YouTube()
youtube.setKey(process.env.GOOGLE_API_TOKEN)

/**
 * Queues a song for playback.
 *
 * @param {Object} video The video object returned by the Youtube Data API.
 * @param {Object} guildClient The guildClient associated with the server of the playback.
 */
function queuedPlay (video, guildClient) {
  // If no video, clean up connection and begin expiration timeout
  if (!video) {
    guildClient.logger.info('Reached end of current song queue')
    // End current dispatcher
    if (guildClient.playing) guildClient.connection.dispatcher.end()
    Functions.playSilence(guildClient)
    guildClient.playing = false
    guildClient.lastCalled = Date.now()
    guildClient.logger.debug('Starting expiration timer')
    setTimeout(() => {
      Functions.cleanupGuildClient(guildClient, Common.botClient)
    }, Config.TIMEOUT + 500)
    return
  }

  // Uses ytdl-core-discord
  guildClient.logger.debug(`Attempting to download from ID ${video.id.videoId}`)
  Ytdl(`http://www.youtube.com/watch?v=${video.id.videoId}`).then(stream => {
    guildClient.logger.debug('Successfully downloaded video, playing audio')
    guildClient.playing = true
    const dispatcher = guildClient.connection.play(stream, {
      type: 'opus',
      highWaterMark: 50
    })
      .on('finish', () => {
        // Cleans up stream and dispatcher
        guildClient.logger.info('Finished song')
        var queue = guildClient.songQueue
        guildClient.playing = false
        dispatcher.destroy()
        stream.destroy()

        // Goes to next song in queue
        if (guildClient.connection) {
          guildClient.logger.info('Moving to next song in queue')
          queue.shift()
          queuedPlay(queue[0], guildClient)
        }
      })
  }).catch('error', error => {
    // Uh oh
    guildClient.logger.error('Youtube error')
    Functions.sendMsg(guildClient.textChannel, `${Emojis.error} ***Sorry, an error occurred on playback!***`, guildClient)
    throw error
  })

  // Sends a message detailing the currently playing video
  guildClient.guild.members.fetch(video.requester)
    .then(member => {
      Functions.sendMsg(guildClient.textChannel,
        [
          `${Emojis.playing} **Now Playing:**`,
          Embeds.createVideoEmbed(video, member.displayName)
        ],
        guildClient)
    })

  // Uses default ytdl-core, not recommended due to ytdl-core-discord having better performance for now
  /* guildClient.playing = true
  guildClient.connection.play(Ytdl(`http://www.youtube.com/watch?v=${video.id.videoId}`, { quality: 'highestaudio' }), {
    highWaterMark: 50
  })
    .on('finish', () => {
      var queue = guildClient.songQueue
      guildClient.playing = false

      if (guildClient.connection) {
        queue.shift()
        queuedPlay(queue[0], guildClient)
      }
    }) */
}

/**
 * Plays or queues a song.
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
  Functions.sendMsg(guildClient.textChannel, `${Emojis.search} ***Searching for*** \`${query}\``, guildClient)

  // Search for the video using the Youtube Data API
  youtube.search(query, 1, function (error, result) {
    if (error) {
      logger.error('Error while searching YouTube')
      throw error
    } else {
      if (!result.items) {
        logger.debug(`No results found for ${query}`)
        Functions.sendMsg(guildClient.textChannel, `${Emojis.sad} ***Could not find results for \`${result}\`***`, guildClient)
        return
      }

      logger.debug('Successfully received results for query')
      logger.debug(result)
      // Adds a property to track who requested the song
      result.items[0].requester = userId
      guildClient.songQueue.push(result.items[0])

      // If not playing anything, play this song
      if (!guildClient.playing) {
        logger.debug(`Playing ${result.items[0]}`)
        queuedPlay(result.items[0], guildClient)
      // If playing something, just say it's queued
      } else {
        guildClient.guild.members.fetch(userId)
          .then(member => {
            logger.debug(`Queued ${result.items[0]}`)
            Functions.sendMsg(guildClient.textChannel,
              [
                `${Emojis.queue} **Queued:**`,
                Embeds.createVideoEmbed(result.items[0], member.displayName)
              ],
              guildClient)
          })
      }
    }
  })
}

module.exports = {
  name: 'play',
  execute: play
}
