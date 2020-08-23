const { Emojis } = require('../../config')
const DadJoke = require('../../web-apis/DadJoke')

/**
 * Tells a dad joke.
 *
 * @param {import('../../structures/CommandContext')} context The command context.
 */
function joke (context) {
  const logger = context.logger
  logger.info('Received joke command')
  DadJoke.get().then(joke => {
    context.sendMsg(
      `${Emojis.joyful} **${joke}**`
    )
  })
}

module.exports = {
  name: 'joke',
  form: 'joke',
  description: 'Tells a random joke.',
  usages: ['VOICE', 'TEXT'],
  execute: joke
}
