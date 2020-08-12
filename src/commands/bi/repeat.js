const { Emojis } = require('../../config')
const Functions = require('../../bot-util/Functions')

/**
 * Repeats a message in chat.
 *
 * @param {import('../../structures/MemberClient')} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Unused parameter.
 */
function repeat (memberClient, args) {
  const logger = memberClient.logger
  logger.info('Received repeat command')
  const msg = args.join(' ')
  memberClient.guildClient.sendMsg(
    `${Emojis.loop} *\u{201c}${Functions.beautify(msg)}\u{201d}* \n   ***${('       \u{2013}  ' + memberClient.member.displayName)}***`
  )
}

module.exports = {
  name: 'repeat',
  execute: repeat
}
