const Emojis = require('../../emojis')
const { Functions } = require('../../bot-util')

/**
 * No description needed.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {String} userClient Unused parameter
 * @param {String[]} args Unused parameter
 */
function chungus (guildClient, userClient, args) {
  const logger = guildClient.logger.child({ user: userClient.id })
  logger.info('Received chungus command')
  Functions.sendMsg(
    guildClient.textChannel,
    `${Emojis.rabbit} ***B I G   C H U N G U S*** ${Emojis.rabbit}`,
    guildClient,
    { files: [`../../resources/chungus/chungus${Functions.random(6)}.jpg`] }
  )
}

module.exports = {
  name: 'chungus',
  execute: chungus
}
