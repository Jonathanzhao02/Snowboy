const { Emojis } = require('../../config')
const Functions = require('../../bot-util/Functions')

/**
 * Flips a two-sided coin.
 *
 * @param {import('../../structures/CommandContext')} context The command context.
 */
function flip (context) {
  const logger = context.logger
  logger.info('Received flip command')
  const result = Functions.random(2)
  context.sendMsg(
    `${result === 0 ? Emojis.heads : Emojis.tails} **I flipped \`${result === 0 ? 'heads' : 'tails'}\`, <@${context.id}>!**`
  )
}

module.exports = {
  name: 'flip',
  form: 'flip',
  description: 'Flips a coin and tells you the result.',
  usages: ['VOICE', 'TEXT'],
  execute: flip
}
