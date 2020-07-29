const { Functions } = require('../../bot-util')
const Common = require('../../common')

/**
 * Prints the raw impression of a user.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {Object} userClient The userClient of the user who requested the command.
 * @param {String[]} args The arguments passed with the command.
 * @param {Discord.Message} msg The sent Message which may contain mentions.
 */
function rawImpression (guildClient, userClient, args, msg) {
  const logger = guildClient.logger.child({ user: userClient.id })
  logger.info('Received raw impression command')
  let member = guildClient.memberClients.get(userClient.id).member

  if (msg.mentions && msg.mentions.members) {
    member = msg.mentions.members.array()[0]
    userClient = Common.botClient.userClients.get(member.id)
  }

  Functions.sendMsg(
    guildClient.textChannel,
    `Raw impression of ${member.displayName}: \`${userClient.impression}\``,
    guildClient
  )
}

module.exports = {
  name: 'rawimpression',
  execute: rawImpression
}
