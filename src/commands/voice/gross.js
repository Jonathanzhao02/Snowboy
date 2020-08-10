const { ImpressionValues, Emojis } = require('../../config')

/**
 * Makes Snowboy grossed out.
 *
 * @param {import('../../structures/MemberClient')} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Unused parameter.
 */
function gross (memberClient, args) {
  const logger = memberClient.logger
  logger.info('Received gross command')
  memberClient.guildClient.sendMsg(
    `${Emojis.weird} **Not much I can do for you, <@${memberClient.id}>**`
  )
  memberClient.userClient.updateImpression(ImpressionValues.GROSS_VALUE)
}

module.exports = {
  name: 'gross',
  execute: gross
}
