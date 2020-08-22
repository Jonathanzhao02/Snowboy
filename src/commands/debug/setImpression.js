const { ImpressionThresholds } = require('../../config')

/**
 * Sets the impression of a member.
 *
 * @param {import('../../structures/MemberClient')} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args The arguments passed with the command.
 * @param {import('discord.js').Message} msg The sent message.
 */
function setImpression (memberClient, args, msg) {
  const logger = memberClient.logger
  logger.info('Received set impression command')
  let val = args[0]
  let id = memberClient.id
  // If insufficient arguments, return
  if (args.length === 0 || args.length >= 3) return
  // If passed in 2 arguments, sets the mentioned user's impression to a value
  if (args.length === 2 && msg.mentions && msg.mentions.members.length > 0) {
    const member = msg.mentions.members.array()[0]
    id = member.id
    val = args[1]
  }
  memberClient = memberClient.guildClient.memberClients.get(id)
  // Ensures a member is found, and that the value is a number between the maximum and minimum values
  if (!memberClient || isNaN(val) || val > ImpressionThresholds.MAX_IMPRESSION || val < ImpressionThresholds.MIN_IMPRESSION) return
  memberClient.userClient.setImpression(val)
  memberClient.guildClient.sendMsg(
    `Set impression of \`${memberClient.member.displayName}\` to \`${val}\``,
    msg.channel
  )
}

module.exports = {
  name: 'setimpression',
  execute: setImpression
}
