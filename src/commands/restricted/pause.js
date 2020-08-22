const { Emojis } = require('../../config')

/**
 * Pauses the current song.
 *
 * @param {import('../../structures/MemberClient')} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Unused parameter.
 * @param {import('discord.js').Message?} msg The sent message.
 */
function pause (memberClient, args, msg) {
  const channel = msg?.channel
  const logger = memberClient.logger
  logger.info('Received pause command')
  if (!memberClient.guildClient.playing) {
    logger.debug('Not playing anything')
    memberClient.guildClient.sendMsg(
      `${Emojis.error} ***Nothing currently playing!***`,
      channel
    )
    return
  }
  logger.debug('Pausing music')
  memberClient.guildClient.guildPlayer.pause()
  memberClient.guildClient.sendMsg(
    `${Emojis.pause} ***Paused the music***`,
    channel
  )
  logger.debug('Successfully paused music')
}

module.exports = {
  name: 'pause',
  form: 'pause',
  description: 'Tells Snowboy to pause the current song.',
  usages: ['VOICE', 'TEXT', 'GUILD_ONLY', 'IN_VOICE'],
  execute: pause
}
