const { Emojis } = require('../../config')
const Strings = require('../../bot-util/Strings')

/**
 * Repeats a message in chat.
 *
 * @param {import('../../structures/MemberClient')} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args The message to repeat.
 * @param {import('discord.js').Message?} msg The sent message.
 */
function repeat (memberClient, args, msg) {
  const channel = msg?.channel
  const logger = memberClient.logger
  logger.info('Received repeat command')
  const message = args.join(' ')
  memberClient.guildClient.sendMsg(
    `${Emojis.loop} *\u{201c}${Strings.beautify(message)}\u{201d}* \n   ***${('       \u{2013}  ' + memberClient.member.displayName)}***`,
    channel
  )
}

module.exports = {
  name: 'repeat',
  form: 'repeat <message>',
  description: 'Tells Snowboy to repeat a message.',
  usages: ['VOICE', 'TEXT'],
  execute: repeat
}
