const { Emojis } = require('../../config')

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
  form: 'play <URL or search terms>',
  description: 'Searches up a playlist or video and adds it to the queue.',
  execute: play
}
