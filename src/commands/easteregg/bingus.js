const { Misc } = require('../../config')
const Functions = require('../../bot-util/Functions')

/**
 * No description needed.
 *
 * @param {import('../../structures/CommandContext')} context The command context.
 */
function bingus (context) {
  const logger = context.logger
  const result = Functions.random(2)
  let count = 1
  let repeats = 0
  if (!context.args.empty) count = context.args.extractNumerical()
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
