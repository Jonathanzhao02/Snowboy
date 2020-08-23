const { ImpressionValues, Emojis } = require('../../config')

/**
 * Makes Snowboy mildy irritated that someone called it just to say nevermind.
 *
 * @param {import('../../structures/CommandContext')} context The command context.
 */
function nevermind (context) {
  const logger = context.logger
  logger.info('Received nevermind command')
  context.sendMsg(
    `${Emojis.angry} **Call me only when you need me, <@${context.id}>!**`
  )
  context.userClient.updateImpression(ImpressionValues.NEVERMIND_VALUE)
}

module.exports = {
  name: 'nevermind',
  usages: ['VOICE', 'GUILD_ONLY', 'WITH_BOT'],
  execute: nevermind
}
