const Embeds = require('../../bot-util/Embeds')

/**
 * Sends the help embed about Snowboy to a user.
 *
 * @param {import('../../structures/MemberClient')} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args The specific command to ask about.
 * @param {import('discord.js').Message} msg Unused parameter.
 */
function help (memberClient, args, msg) {
  const logger = memberClient.logger
  logger.info('Received help command')
  memberClient.userClient.sendMsg(Embeds.createHelpEmbed(require('../index').all, args[0]))
}

module.exports = {
  name: 'help',
  form: 'help <command name, or no arguments>',
  description: 'Asks Snowboy about all available commands.',
  usages: ['TEXT'],
  execute: help
}
