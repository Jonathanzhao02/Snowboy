const { Emojis } = require('../../config')
const Functions = require('../../bot-util/Functions')
const Embeds = require('../../bot-util/Embeds')
const Imgsearch = require('g-i-s')

/**
 * Searches up and prints the top result of an image search query.
 *
 * @param {import('../../structures/CommandContext')} context The command context.
 */
function showMe (context) {
  const logger = context.logger
  logger.info('Received showme command')
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
  Imgsearch(query, async (error, results) => {
    if (error) throw error

    while (results.length > 0) {
      const result = results.shift()

      try {
        await Functions.validateURL(result.url)
        result.query = query
        logger.debug('Received valid result')
        logger.debug(result)
        context.sendMsg(
          Embeds.createImageEmbed(
            result,
            context.name
          )
        )
        return
      } catch (err) {
        logger.error(err)
        logger.debug('Invalid URL %s', result.url)
      }
    }

    logger.info('No results found for %s', query)
    context.sendMsg(
      `${Emojis.error} ***No results found for \`${query}\`!***`
    )
  })
}

module.exports = {
  name: 'showme',
  aliases: ['imagesearch', 'imgsearch'],
  form: 'showme <search terms>',
  description: 'Searches up and tells you the first image result of a query.',
  usages: ['VOICE', 'TEXT'],
  execute: showMe
}
