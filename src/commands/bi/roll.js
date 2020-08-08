const { Emojis } = require('../../config')
const Functions = require('../../bot-util/Functions')

/**
 * Rolls a six-sided die.
 *
 * @param {import('../../structures/MemberClient')} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Unused parameter.
 */
function roll (memberClient, args) {
  const logger = memberClient.logger
  logger.info('Received roll command')
  memberClient.guildClient.sendMsg(
    `${Emojis.dice} **I rolled a \`${Functions.random(6) + 1}\`, <@${memberClient.id}>!**`
  )
}

module.exports = {
  name: 'roll',
  execute: roll
}
