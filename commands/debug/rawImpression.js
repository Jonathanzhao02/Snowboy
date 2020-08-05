const Common = require('../../bot-util/Common')
const Functions = require('../../bot-util/Functions')

/**
 * Prints the raw impression of a user.
 *
 * @param {Object} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args The arguments passed with the command.
 * @param {Discord.Message} msg The sent Message which may contain mentions.
 */
function rawImpression (memberClient, args, msg) {
  const logger = memberClient.logger
  logger.info('Received raw impression command')
  let member = memberClient.member
  let userClient = memberClient.userClient

  if (msg.mentions && msg.mentions.members.length > 0) {
    member = msg.mentions.members.array()[0]
    userClient = Common.botClient.userClients.get(member.id)
  }

  Functions.sendMsg(
    memberClient.guildClient.textChannel,
    `Raw impression of ${member.displayName}: \`${userClient.impression}\``
  )
}

module.exports = {
  name: 'rawimpression',
  execute: rawImpression
}
