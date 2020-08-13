const Embeds = require('../../bot-util/Embeds')
const Common = require('../../bot-util/Common')
const Discord = require('discord.js')

/**
 * Sends an invite link for Snowboy.
 *
 * @param {import('../../structures/MemberClient')} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Unused parameter.
 * @param {Discord.Message} msg The Message the user sent.
 */
function invite (memberClient, args, msg) {
  const logger = memberClient.logger
  logger.info('Received invite command')
  Common.botClient.generateInvite([
    Discord.Permissions.FLAGS.CONNECT,
    Discord.Permissions.FLAGS.SPEAK,
    Discord.Permissions.FLAGS.DEAFEN_MEMBERS,
    Discord.Permissions.FLAGS.SEND_MESSAGES,
    Discord.Permissions.FLAGS.MANAGE_MESSAGES,
    Discord.Permissions.FLAGS.EMBED_LINKS,
    Discord.Permissions.FLAGS.ATTACH_FILES,
    Discord.Permissions.FLAGS.READ_MESSAGE_HISTORY,
    Discord.Permissions.FLAGS.ADD_REACTIONS
  ]).then(link => {
    memberClient.guildClient.sendMsg(
      Embeds.createInviteEmbed(link)
    )
  })
}

module.exports = {
  name: 'invite',
  form: 'invite',
  description: 'Gives you an invite link for Snowboy.',
  execute: invite
}
