const { Emojis } = require('../../config')
const Functions = require('../../bot-util/Functions')
const Common = require('../../bot-util/Common')

/**
 * No description needed.
 *
 * @param {import('../../structures/MemberClient')} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Unused parameter
 * @param {import('discord.js').Message?} msg The sent message.
 */
function chungus (memberClient, args, msg) {
  const channel = msg ? msg.channel : undefined
  const logger = memberClient.logger
  logger.info('Received chungus command')
  memberClient.guildClient.sendMsg(
    `${Emojis.rabbit} ***B I G   C H U N G U S*** ${Emojis.rabbit}`,
    channel,
    { files: [`${Common.defaultResdir}/chungus/chungus${Functions.random(6)}.jpg`] }
  )
}

module.exports = {
  name: 'chungus',
  execute: chungus
}
