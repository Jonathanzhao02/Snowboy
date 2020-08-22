const Common = require('../../bot-util/Common')

/**
 * Prints the raw impression of a user.
 *
 * @param {import('../../structures/CommandContext')} context The command context.
 */
function rawImpression (context) {
  const logger = context.logger
  logger.info('Received raw impression command')
  let member = context.memberClient.member
  let userClient = context.userClient

  if (context.msg.mentions && context.msg.mentions.members.length > 0) {
    member = context.msg.mentions.members.array()[0]
    userClient = Common.botClient.userClients.get(member.id)
  }

  context.sendMsg(
    `Raw impression of ${member.displayName}: \`${userClient.impression}\``
  )
}

module.exports = {
  name: 'rawimpression',
  usages: ['TEXT', 'GUILD_ONLY', 'DEBUG_ONLY'],
  execute: rawImpression
}
