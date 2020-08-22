const { Emojis } = require('../../config')
const Functions = require('../../bot-util/Functions')

/**
 * Rolls a six-sided die.
 *
 * @param {import('../../structures/MemberClient')} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Unused parameter.
 * @param {import('discord.js').Message?} msg The sent message.
 */
function roll (memberClient, args, msg) {
  const channel = msg?.channel
  const logger = memberClient.logger
  logger.info('Received roll command')
  memberClient.guildClient.sendMsg(
    `${Emojis.dice} **I rolled a \`${Functions.random(6) + 1}\`, <@${memberClient.id}>!**`,
    channel
  )
}

module.exports = {
  name: 'roll',
  form: 'roll',
  description: 'Rolls a 6-sided die and tells you the result.',
  usages: ['VOICE', 'TEXT'],
  execute: roll
}
