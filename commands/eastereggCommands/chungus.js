const { Emojis } = require('../../config')
const { Functions } = require('../../bot-util')

/**
 * No description needed.
 *
 * @param {Object} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Unused parameter
 */
function chungus (memberClient, args) {
  const logger = memberClient.logger
  logger.info('Received chungus command')
  Functions.sendMsg(
    memberClient.guildClient.textChannel,
    `${Emojis.rabbit} ***B I G   C H U N G U S*** ${Emojis.rabbit}`,
    null,
    { files: [`../../resources/chungus/chungus${Functions.random(6)}.jpg`] }
  )
}

module.exports = {
  name: 'chungus',
  execute: chungus
}
