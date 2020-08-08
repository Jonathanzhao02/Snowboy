const { Emojis } = require('../../config')
const Functions = require('../../bot-util/Functions')
const Common = require('../../bot-util/Common')

/**
 * No description needed.
 *
 * @param {import('../../structures/MemberClient')} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Unused parameter
 */
function chungus (memberClient, args) {
  const logger = memberClient.logger
  logger.info('Received chungus command')
  memberClient.guildClient.sendMsg(
    `${Emojis.rabbit} ***B I G   C H U N G U S*** ${Emojis.rabbit}`,
    { files: [`${Common.defaultResdir}/chungus/chungus${Functions.random(6)}.jpg`] }
  )
}

module.exports = {
  name: 'chungus',
  execute: chungus
}
