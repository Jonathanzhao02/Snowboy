const { Emojis } = require('../../config')
const { Embeds, Functions } = require('../../bot-util')

const Gsearch = require('../../web_apis/gsearch')

/**
 * Searches up and prints the top result of a search query.
 *
 * @param {Object} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args The search query.
 */
function search (memberClient, args) {
  const logger = memberClient.logger
  logger.info('Received search command')
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
  Gsearch.search(query, result => {
    logger.debug('Received result')
    logger.debug(result)
    Functions.sendMsg(
      memberClient.guildClient.textChannel,
      Embeds.createSearchEmbed(
        result,
        memberClient.member.displayName
      )
    )
  })
}

module.exports = {
  name: 'search',
  execute: search
}
