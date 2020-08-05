const Common = require('../../bot-util/Common')
const Functions = require('../../bot-util/Functions')
const Embeds = require('../../bot-util/Embeds')

/**
 * Prints the about embed of Snowboy.
 *
 * @param {import('../../structures/MemberClient')} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Unused parameter.
 * @param {import('discord.js').Message} msg Unused parameter.
 */
function about (memberClient, args, msg) {
  const logger = memberClient.logger
  logger.info('Received about command')
  Functions.sendMsg(
    memberClient.guildClient.textChannel,
    Embeds.createAboutEmbed(Common.botClient)
  )
}

module.exports = {
  name: 'about',
  execute: about
}
