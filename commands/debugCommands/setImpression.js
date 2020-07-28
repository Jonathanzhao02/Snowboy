const Common = require('../../common')
const Emojis = require('../../emojis')
const { Functions } = require('../../bot-util')

const Config = require('../../config')

/**
 * Sets the impression of a member.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {String} userId The ID of the user who requested the command.
 * @param {String[]} args The arguments passed with the command.
 */
function setImpression (guildClient, userId, args) {
  const logger = guildClient.logger.child({ user: userId })
  logger.info('Received set impression command')
  var val = args[0]
  var id = userId
  // If insufficient arguments, return
  if (args.length === 0 || args.length >= 3) return
  // If passed in 2 arguments, sets the mentioned user's impression to a value
  if (args.length === 2) {
    const mmbr = Functions.findMember(args[0], guildClient.guild)
    if (!mmbr) {
      Functions.sendMsg(guildClient.textChannel, `${Emojis.error} ***Could not find user \`${args[0]}\`***`, guildClient)
      return
    }
    id = mmbr.id
    val = args[1]
  }
  const member = guildClient.members.get(id)
  // Ensures a member is found, and that the value is a number between the maximum and minimum values
  if (!member || isNaN(val) || val > Config.ImpressionThresholds.MAX_IMPRESSION || val < Config.ImpressionThresholds.MIN_IMPRESSION) return
  const userClient = Common.botClient.userClients.get(id)
  Functions.updateImpression(Common.uKeyv, id, userClient, val - userClient.impression)
  Functions.sendMsg(guildClient.textChannel, `Set impression of \`${member.member.displayName}\` to \`${val}\``, guildClient)
}

module.exports = {
  name: 'setimpression',
  execute: setImpression
}
