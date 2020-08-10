const { ImpressionValues, Emojis } = require('../../config')

/**
 * Makes Snowboy happy.
 *
 * @param {import('../../structures/MemberClient')} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Unused parameter.
 */
function compliment (memberClient, args) {
  const logger = memberClient.logger
  logger.info('Received compliment command')
  memberClient.guildClient.sendMsg(
    `${Emojis.happy} **Thank you!**`
  )
  memberClient.userClient.updateImpression(ImpressionValues.HAPPY_VALUE)
}

module.exports = {
  name: 'compliment',
  execute: compliment
}
