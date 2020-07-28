const Emojis = require('../../emojis')
const { Functions } = require('../../bot-util')

const Common = require('../../common')

/**
 * Prints the raw impression of a user.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {Object} userClient The userClient of the user who requested the command.
 * @param {String[]} args The arguments passed with the command.
 */
function rawImpression (guildClient, userClient, args) {
  const logger = guildClient.logger.child({ user: userClient.id })
  logger.info('Received raw impression command')
  let member = guildClient.memberClients.get(userClient.id).member

  // Finds the member mentioned in the arguments
  if (args[0]) {
    const mmbr = Functions.findMember(args[0], guildClient.guild)
    if (!mmbr) {
      Functions.sendMsg(
        guildClient.textChannel,
        `${Emojis.error} ***Could not find user \`${args[0]}\`***`,
        guildClient
      )
      return
    }
    member = mmbr
    if (!guildClient.memberClients.get(member.id)) {
      Functions.sendMsg(
        guildClient.textChannel,
        `${Emojis.error} ***Could not find data for user \`${args[0]}\`***`,
        guildClient
      )
      return
    }

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
