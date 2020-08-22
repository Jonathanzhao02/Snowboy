const { Emojis } = require('../../config')
const Strings = require('../../bot-util/Strings')

/**
 * Repeats a message in chat.
 *
 * @param {import('../../structures/CommandContext')} context The command context.
 */
function repeat (context) {
  const logger = context.logger
  logger.info('Received repeat command')
  const message = context.args.join(' ')
  context.sendMsg(
    `${Emojis.loop} *\u{201c}${Strings.beautify(message)}\u{201d}* \n   ***${('       \u{2013}  ' + context.name)}***`
  )
}

module.exports = {
  name: 'repeat',
  form: 'repeat <message>',
  description: 'Tells Snowboy to repeat a message.',
  usages: ['VOICE', 'TEXT'],
  execute: repeat
}
