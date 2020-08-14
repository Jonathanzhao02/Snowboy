const Common = require('../../bot-util/Common')

/**
 * Prints the raw impression of a user.
 *
 * @param {import('../../structures/MemberClient')} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args The arguments passed with the command.
 * @param {import('discord.js').Message} msg The sent message.
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

  memberClient.guildClient.sendMsg(
    `Raw impression of ${member.displayName}: \`${userClient.impression}\``,
    msg.channel
  )
}

module.exports = {
  name: 'rawimpression',
  execute: rawImpression
}
