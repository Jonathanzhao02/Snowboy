const { Emojis } = require('../../config')
const { Embeds, Functions } = require('../../bot-util')

const Imgsearch = require('g-i-s')

/**
 * Searches up and prints the top result of an image search query.
 *
 * @param {Object} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args The search query.
 */
function showMe (memberClient, args) {
  const logger = memberClient.logger
  logger.info('Received showme command')
  if (!args || args.length === 0) {
    logger.debug('No query found')
    Functions.sendMsg(
      memberClient.guildClient.textChannel,
      `${Emojis.error} ***I need something to search up!***`
    )
    return
  }

  const query = args.join(' ')
  Functions.sendMsg(
    memberClient.guildClient.textChannel,
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
        Functions.sendMsg(
          memberClient.guildClient.textChannel,
          Embeds.createImageEmbed(
            result,
            memberClient.member.displayName
          )
        )
        return
      } catch (err) {
        logger.warn(err)
        logger.debug('Invalid URL %s', result.url)
      }
    }

    logger.info('No results found for %s', query)
    Functions.sendMsg(
      memberClient.guildClient.textChannel,
      `${Emojis.error} ***No results found for \`${query}\`!***`
    )
  })
}

module.exports = {
  name: 'showme',
  aliases: ['imagesearch', 'imgsearch'],
  execute: showMe
}
