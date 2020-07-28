const Emojis = require('../../emojis')
const { Functions } = require('../../bot-util')

/**
 * Rolls a six-sided die.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {Object} userClient The userClient of the user who requested the command.
 * @param {String[]} args Unused parameter.
 */
function roll (guildClient, userClient, args) {
  const logger = guildClient.logger.child({ user: userClient.id })
  logger.info('Received roll command')
  Functions.sendMsg(
    guildClient.textChannel,
    `${Emojis.dice} **I rolled a \`${Functions.random(6) + 1}\`, <@${userClient.id}>!**`,
    guildClient
  )
}

module.exports = {
  name: 'roll',
  execute: roll
}
