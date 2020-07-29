const Common = require('../../common')
const { Embeds, Functions } = require('../../bot-util')

/**
 * Prints the about embed of Snowboy.
 *
 * @param {Object} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Unused parameter.
 * @param {Discord.Message} msg Unused parameter.
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
