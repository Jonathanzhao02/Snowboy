const { Emojis } = require('../../config')
const Functions = require('../../bot-util/Functions')
const Common = require('../../bot-util/Common')

/**
 * No description needed.
 *
 * @param {import('../../structures/CommandContext')} context The command context.
 */
function chungus (context) {
  const logger = context.logger
  logger.info('Received chungus command')
  context.sendMsg(
    `${Emojis.rabbit} ***B I G   C H U N G U S*** ${Emojis.rabbit}`,
    { files: [`${Common.defaultResdir}/chungus/chungus${Functions.random(6)}.jpg`] }
  )
}

module.exports = {
  name: 'chungus',
  usages: ['VOICE', 'TEXT', 'GUILD_ONLY'],
  execute: chungus
}
