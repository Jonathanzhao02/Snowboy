const { Emojis } = require('../../config')
const Functions = require('../../bot-util/Functions')

/**
 * Flips a two-sided coin.
 *
 * @param {import('../../structures/MemberClient')} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Unused parameter.
 */
function flip (memberClient, args) {
  const logger = memberClient.logger
  logger.info('Received flip command')
  const result = Functions.random(2)
  memberClient.guildClient.sendMsg(
    `${result === 0 ? Emojis.heads : Emojis.tails} **I flipped \`${result === 0 ? 'heads' : 'tails'}\`, <@${memberClient.id}>!**`
  )
}

module.exports = {
  name: 'flip',
  form: 'flip',
  description: 'Flips a coin and tells you the result.',
  execute: flip
}
