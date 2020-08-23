const { Emojis, Paths } = require('../../config')
const Functions = require('../../bot-util/Functions')

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
    { files: [`${Paths.defaultResdir}/chungus/chungus${Functions.random(6)}.jpg`] }
  )
}

module.exports = {
  name: 'chungus',
  usages: ['VOICE', 'TEXT'],
  execute: chungus
}
