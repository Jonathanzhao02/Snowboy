const Common = require('../../common')
const { Functions } = require('../../bot-util')

const Config = require('../../config')

/**
 * Sets the impression of a member.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {Object} userClient The userClient of the user who requested the command.
 * @param {String[]} args The arguments passed with the command.
 * @param {Discord.Message} msg The sent Message that may contain mentions.
 */
function setImpression (guildClient, userClient, args, msg) {
  const logger = guildClient.logger.child({ user: userClient.id })
  logger.info('Received set impression command')
  let val = args[0]
  let id = userClient.id
  // If insufficient arguments, return
  if (args.length === 0 || args.length >= 3) return
  // If passed in 2 arguments, sets the mentioned user's impression to a value
  if (args.length === 2 && msg.mentions && msg.mentions.members) {
    const member = msg.mentions.members.array()[0]
    id = member.id
    val = args[1]
  }
  const memberClient = guildClient.memberClients.get(id)
  // Ensures a member is found, and that the value is a number between the maximum and minimum values
  if (!memberClient || isNaN(val) || val > Config.ImpressionThresholds.MAX_IMPRESSION || val < Config.ImpressionThresholds.MIN_IMPRESSION) return
  const usrClient = Common.botClient.userClients.get(id)
  Functions.updateImpression(Common.uKeyv, id, usrClient, val - usrClient.impression)
  Functions.sendMsg(guildClient.textChannel, `Set impression of \`${memberClient.member.displayName}\` to \`${val}\``, guildClient)
}

module.exports = {
  name: 'setimpression',
  execute: setImpression
}
