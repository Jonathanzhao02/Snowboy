const { ImpressionValues, Emojis } = require('../../config')

/**
 * Makes Snowboy sad.
 *
 * @param {import('../../structures/MemberClient')} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Unused parameter.
 */
function insult (memberClient, args) {
  const logger = memberClient.logger
  logger.info('Received insult command')
  memberClient.guildClient.sendMsg(
    `${Emojis.sad} *Okay...*`
  )
  memberClient.userClient.updateImpression(ImpressionValues.SAD_VALUE)
}

module.exports = {
  name: 'insult',
  execute: insult
}
