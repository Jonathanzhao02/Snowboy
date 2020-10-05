const { Misc } = require('../../config')
const Functions = require('../../bot-util/Functions')

/**
 * No description needed.
 *
 * @param {import('../../structures/CommandContext')} context The command context.
 */
function bingus (context) {
  const logger = context.logger
  let count = 1
  let repeats = 0
  let result = Functions.random(2)
  if (context.args.containsNumerical()) count = context.args.extractNumerical()
  if (!context.args.empty) result = context.args.pop() === 'love'
  logger.info('Received bingus command')
  const intervalID = context.bot.setInterval(_ => {
    context.sendMsg(
      result ? Misc.LOVE_BINGUS : Misc.HATE_BINGUS
    )
    repeats++

    if (repeats >= count) {
      context.bot.clearInterval(intervalID)
    }
  }, 500)
}

module.exports = {
  name: 'bingus',
  usages: ['TEXT'],
  execute: bingus
}
