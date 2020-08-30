const Embeds = require('../../bot-util/Embeds')
const Discord = require('discord.js')

/**
 * Sends an invite link for Snowboy.
 *
 * @param {import('../../structures/CommandContext')} context The command context.
 */
function invite (context) {
  const logger = context.logger
  logger.info('Received invite command')
  context.bot.generateInvite([
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
    context.sendMsg(
      Embeds.createInviteEmbed(link, context.bot)
    )
  })
}

module.exports = {
  name: 'invite',
  form: 'invite',
  description: 'Gives you an invite link for Snowboy.',
  usages: ['TEXT'],
  execute: invite
}
