const Emojis = require('../../emojis')
const { Functions } = require('../../bot-util')

/**
 * Flips a two-sided coin.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {Object} userClient The userClient of the user who requested the command.
 * @param {String[]} args Unused parameter.
 */
function flip (guildClient, userClient, args) {
  const logger = guildClient.logger.child({ user: userClient.id })
  logger.info('Received flip command')
  const result = Functions.random(2)
  Functions.sendMsg(
    guildClient.textChannel,
    `${result === 0 ? Emojis.heads : Emojis.tails} **I flipped \`${result === 0 ? 'heads' : 'tails'}\`, <@${userClient.id}>!**`,
    guildClient
  )
}

module.exports = {
  name: 'flip',
  execute: flip
}
