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
  memberClient.guildClient.sendMsg(
    Embeds.createAboutEmbed()
  )
}

module.exports = {
  name: 'about',
  form: 'about',
  description: 'Asks Snowboy to send an embed about himself.',
  execute: about
}
