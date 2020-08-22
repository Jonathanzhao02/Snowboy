const { Emojis } = require('../../config')
const DadJoke = require('../../web-apis/DadJoke')

/**
 * Tells a dad joke.
 *
 * @param {import('../../structures/MemberClient')} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Unused parameter.
 * @param {import('discord.js').Message?} msg The sent message.
 */
function joke (memberClient, args, msg) {
  const channel = msg?.channel
  const logger = memberClient.logger
  logger.info('Received joke command')
  DadJoke.get().then(joke => {
    memberClient.guildClient.sendMsg(
      `${Emojis.joyful} **${joke}**`,
      channel
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
