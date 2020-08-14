const { Emojis } = require('../../config')

/**
 * Stops all song playback and clears the queue.
 *
 * @param {import('../../structures/MemberClient')} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Unused parameter.
 * @param {import('discord.js').Message?} msg The sent message.
 */
function stop (memberClient, args, msg) {
  const channel = msg ? msg.channel : undefined
  const logger = memberClient.logger
  logger.info('Received stop command')
  if (!memberClient.guildClient.playing) {
    logger.debug('Not playing anything')
    memberClient.guildClient.sendMsg(
      `${Emojis.error} ***Nothing currently playing!***`,
      channel
    )
    return
  }
  logger.debug('Stopping music')
  memberClient.guildClient.guildPlayer.stop()
  memberClient.guildClient.sendMsg(
    `${Emojis.stop} ***Stopped the music***`,
    channel
  )
  logger.debug('Successfully stopped music')
}

module.exports = {
  name: 'stop',
  form: 'stop',
  description: 'Tells Snowboy to stop the current song and clear the queue.',
  execute: stop
}
