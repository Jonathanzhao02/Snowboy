const { Emojis } = require('../../config')
const Functions = require('../../bot-util/Functions')

/**
 * Rolls a six-sided die.
 *
 * @param {Object} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Unused parameter.
 */
function roll (memberClient, args) {
  const logger = memberClient.logger
  logger.info('Received roll command')
  Functions.sendMsg(
    memberClient.guildClient.textChannel,
    `${Emojis.dice} **I rolled a \`${Functions.random(6) + 1}\`, <@${memberClient.id}>!**`,
    memberClient.guildClient.settings.mentions
  )
}

module.exports = {
  name: 'roll',
  execute: roll
}
