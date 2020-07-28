const Common = require('../../common')
const Emojis = require('../../emojis')
const { Functions } = require('../../bot-util')

/**
 * Prints the stats of Snowboy.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {Object} userClient Unused parameter.
 * @param {String[]} args Unused parameter.
 * @param {Discord.Message} msg Unused parameter.
 */
function stats (guildClient, userClient, args, msg) {
  const logger = guildClient.logger.child({ user: userClient.id })
  logger.info('Received stats command')
  Functions.sendMsg(
    guildClient.textChannel,
    `${Emojis.stats} **I am currently in \`${Common.botClient.guilds.cache.size}\` servers!**`,
    guildClient
  )
}

module.exports = {
  name: 'stats',
  execute: stats
}
