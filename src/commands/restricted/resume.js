const { Emojis } = require('../../config')

/**
 * Resumes the current song.
 *
 * @param {import('../../structures/MemberClient')} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Unused parameter.
 * @param {import('discord.js').Message?} msg The sent message.
 */
function resume (memberClient, args, msg) {
  const channel = msg?.channel
  const logger = memberClient.logger
  logger.info('Received resume command')
  if (!memberClient.guildClient.playing) {
    logger.debug('Not playing anything')
    memberClient.guildClient.sendMsg(
      `${Emojis.error} ***Nothing currently playing!***`,
      channel
    )
    return
  }
  logger.debug('Resuming music')
  memberClient.guildClient.guildPlayer.resume()
  memberClient.guildClient.sendMsg(
    `${Emojis.playing} **Resuming!**`,
    channel
  )
  logger.debug('Successfully resumed music')
}

module.exports = {
  name: 'resume',
  form: 'resume',
  description: 'Tells Snowboy to resume the current song.',
  usages: ['VOICE', 'TEXT', 'GUILD_ONLY', 'IN_VOICE'],
  execute: resume
}
