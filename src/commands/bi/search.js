const { Emojis } = require('../../config')
const Embeds = require('../../bot-util/Embeds')
const Gsearch = require('../../web-apis/Gsearch')

/**
 * Searches up and prints the top result of a search query.
 *
 * @param {import('../../structures/CommandContext')} context The command context.
 */
function search (context) {
  const logger = context.logger
  logger.info('Received search command')
  if (!context.args || context.args.length === 0) {
    logger.debug('No query found')
    context.sendMsg(
      `${Emojis.error} ***I need something to search up!***`
    )
    return
  }

  const query = context.args.join(' ')
  context.sendMsg(
    `${Emojis.search} ***Searching*** \`${query}\``
  )

  logger.debug('Searching up %s', query)
  Gsearch.search(query).then(result => {
    logger.debug('Received result')
    logger.debug(result)
    context.sendMsg(
      Embeds.createSearchEmbed(
        result,
        context.name
      )
    )
  })
}

module.exports = {
  name: 'search',
  form: 'search <search terms>',
  description: 'Searches up and tells you the first result of a query.',
  usages: ['VOICE', 'TEXT'],
  execute: search
}
