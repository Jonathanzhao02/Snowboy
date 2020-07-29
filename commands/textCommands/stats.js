const Common = require('../../common')
const Emojis = require('../../emojis')
const { Functions } = require('../../bot-util')

/**
 * Prints the stats of Snowboy.
 *
 * @param {Object} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Unused parameter.
 * @param {Discord.Message} msg Unused parameter.
 */
function stats (memberClient, args, msg) {
  const logger = memberClient.logger
  logger.info('Received stats command')
  Functions.sendMsg(
    memberClient.guildClient.textChannel,
    `${Emojis.stats} **I am currently in \`${Common.botClient.guilds.cache.size}\` servers!**`
  )
}

module.exports = {
  name: 'stats',
  execute: stats
}
