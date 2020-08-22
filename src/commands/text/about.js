const Embeds = require('../../bot-util/Embeds')

/**
 * Prints the about embed of Snowboy.
 *
 * @param {import('../../structures/CommandContext')} context The command context.
 */
function about (context) {
  const logger = context.logger
  logger.info('Received about command')
  context.sendMsg(
    Embeds.createAboutEmbed()
  )
}

module.exports = {
  name: 'about',
  form: 'about',
  description: 'Asks Snowboy to send an embed about himself.',
  usages: ['TEXT'],
  execute: about
}
