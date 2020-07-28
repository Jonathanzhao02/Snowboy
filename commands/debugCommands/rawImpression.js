const Emojis = require('../../emojis')
const { Functions } = require('../../bot-util')

const { botClient } = require('../../common')

/**
 * Prints the raw impression of a user.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {String} userId The ID of the user who requested the command.
 * @param {String[]} args The arguments passed with the command.
 */
function rawImpression (guildClient, userId, args) {
  const logger = guildClient.logger.child({ user: userId })
  logger.info('Received raw impression command')
  let member = guildClient.members.get(userId).member

  // Finds the member mentioned in the arguments
  if (args[0]) {
    const mmbr = Functions.findMember(args[0], guildClient.guild)
    if (!mmbr) {
      Functions.sendMsg(guildClient.textChannel, `${Emojis.error} ***Could not find user \`${args[0]}\`***`, guildClient)
      return
    }
    member = mmbr
    if (!guildClient.members.get(member.id)) {
      Functions.sendMsg(guildClient.textChannel, `${Emojis.error} ***Could not find data for user \`${args[0]}\`***`, guildClient)
      return
    }
  }

  Functions.sendMsg(guildClient.textChannel,
    `Raw impression of ${member.displayName}: \`${botClient.userClients.get(member.id).impression}\``,
    guildClient)
}

module.exports = {
  name: 'rawimpression',
  execute: rawImpression
}
