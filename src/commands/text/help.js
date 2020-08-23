const Embeds = require('../../bot-util/Embeds')

/**
 * Sends the help embed about Snowboy to a user.
 *
 * @param {import('../../structures/CommandContext')} context The command context.
 */
function help (context) {
  const logger = context.logger
  logger.info('Received help command')
  context.sendMsg(Embeds.createHelpEmbed(require('../index'), context.args[0]))
}

module.exports = {
  name: 'help',
  form: 'help <command name, or no arguments>',
  description: 'Asks Snowboy about all available commands.',
  usages: ['TEXT'],
  execute: help
}
