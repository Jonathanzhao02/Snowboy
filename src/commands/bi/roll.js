const { Emojis } = require('../../config')
const Functions = require('../../bot-util/Functions')

/**
 * Rolls a six-sided die.
 *
 * @param {import('../../structures/CommandContext')} context The command context.
 */
function roll (context) {
  const logger = context.logger
  logger.info('Received roll command')
  context.sendMsg(
    `${Emojis.dice} **I rolled a \`${Functions.random(6) + 1}\`, <@${context.id}>!**`
  )
}

module.exports = {
  name: 'roll',
  form: 'roll',
  description: 'Rolls a 6-sided die and tells you the result.',
  usages: ['VOICE', 'TEXT'],
  execute: roll
}
