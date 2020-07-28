const Common = require('../../common')
const { Embeds, Functions } = require('../../bot-util')

/**
 * Prints the about embed of Snowboy.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {Object} userClient Unused parameter.
 * @param {String[]} args Unused parameter.
 * @param {Discord.Message} msg Unused parameter.
 */
function about (guildClient, userClient, args, msg) {
  const logger = guildClient.logger.child({ user: userClient.id })
  logger.info('Received about command')
  Functions.sendMsg(
    guildClient.textChannel,
    Embeds.createAboutEmbed(Common.botClient),
    guildClient
  )
}

module.exports = {
  name: 'about',
  execute: about
}
