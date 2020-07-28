const Emojis = require('../../emojis')
const { Embeds, Functions } = require('../../bot-util')

const Imgsearch = require('g-i-s')

/**
 * Searches up and prints the top result of an image search query.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {Object} userClient The userClient of the user who requested the search.
 * @param {String[]} args The search query.
 */
function showMe (guildClient, userClient, args) {
  const logger = guildClient.logger.child({ user: userClient.id })
  logger.info('Received showme command')
  if (!args || args.length === 0) {
    logger.debug('No query found')
    Functions.sendMsg(guildClient.textChannel, `${Emojis.error} ***I need something to search up!***`, guildClient)
    return
  }

  const query = args.join(' ')
  Functions.sendMsg(guildClient.textChannel, `${Emojis.search} ***Searching*** \`${query}\``, guildClient)
  logger.debug(`Searching up ${query}`)
  Imgsearch(query, (error, results) => {
    if (error) throw error
    const result = results[Functions.random(results.length > 10 ? results.length : 10)]
    result.query = query
    logger.debug('Received result')
    logger.debug(result)
    Functions.sendMsg(
      guildClient.textChannel,
      Embeds.createImageEmbed(
        result,
        guildClient.memberClients.get(userClient.id).member.displayName
      ),
      guildClient
    )
  })
}

module.exports = {
  name: 'showme',
  aliases: ['imagesearch', 'imgsearch'],
  execute: showMe
}
