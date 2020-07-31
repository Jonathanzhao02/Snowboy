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
  logger.debug(`Searching up ${query}`)
  Imgsearch(query, (error, results) => {
    if (error) throw error
    const result = results[Functions.random(results.length > 10 ? results.length : 10)]
    result.query = query
    logger.debug('Received result')
    logger.debug(result)
    Functions.sendMsg(
      memberClient.guildClient.textChannel,
      Embeds.createImageEmbed(
        result,
        memberClient.member.displayName
      )
    )
  })
}

module.exports = {
  name: 'showme',
  aliases: ['imagesearch', 'imgsearch'],
  execute: showMe
}
