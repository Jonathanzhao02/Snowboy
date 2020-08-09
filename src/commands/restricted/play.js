const { Emojis } = require('../../config')
const Embeds = require('../../bot-util/Embeds')
const YtdlDiscord = require('ytdl-core-discord')
const Ytpl = require('ytpl')
const Ytsearch = require('yt-search')

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
  if (!memberClient.guildClient.connection) {
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

  memberClient.guildClient.guildPlayer.queuer.search(query, memberClient.member.displayName)
}

module.exports = {
  name: 'play',
  execute: play
}