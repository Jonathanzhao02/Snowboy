const { ImpressionThresholds } = require('../../config')

/**
 * Sets the impression of a member.
 *
 * @param {import('../../structures/CommandContext')} context The command context.
 */
function setImpression (context) {
  const logger = context.logger
  logger.info('Received set impression command')
  let val = context.args.first
  let id = context.id
  // If insufficient arguments, return
  if (context.args.length === 0 || context.args.length >= 3) return
  // If passed in 2 arguments, sets the mentioned user's impression to a value
  if (context.args.length === 2 && context.msg.mentions && context.msg.mentions.members.length > 0) {
    const member = context.args.firstMemberMention()
    id = member.id
    val = context.args.get(1)
  }
  const memberClient = context.guildClient.memberClients.get(id)
  // Ensures a member is found, and that the value is a number between the maximum and minimum values
  if (!memberClient || isNaN(val) || val > ImpressionThresholds.MAX_IMPRESSION || val < ImpressionThresholds.MIN_IMPRESSION) return
  memberClient.userClient.setImpression(val)
  context.sendMsg(
    `Set impression of \`${memberClient.member.displayName}\` to \`${val}\``
  )
}

module.exports = {
  name: 'setimpression',
  usages: ['TEXT', 'GUILD_ONLY', 'DEBUG_ONLY'],
  execute: setImpression
}
