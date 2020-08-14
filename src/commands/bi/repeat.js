const { Emojis } = require('../../config')
const Functions = require('../../bot-util/Functions')

/**
 * Repeats a message in chat.
 *
 * @param {import('../../structures/MemberClient')} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args The message to repeat.
 * @param {import('discord.js').Message?} msg The sent message.
 */
function repeat (memberClient, args, msg) {
  const channel = msg ? msg.channel : undefined
  const logger = memberClient.logger
  logger.info('Received repeat command')
  const message = args.join(' ')
  memberClient.guildClient.sendMsg(
    `${Emojis.loop} *\u{201c}${Functions.beautify(message)}\u{201d}* \n   ***${('       \u{2013}  ' + memberClient.member.displayName)}***`,
    channel
  )
}

module.exports = {
  name: 'repeat',
  form: 'repeat <message>',
  description: 'Tells Snowboy to repeat a message.',
  execute: repeat
}
