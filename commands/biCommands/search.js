const Emojis = require('../../emojis')
const { Embeds, Functions } = require('../../bot-util')

const Gsearch = require('../../web_apis/gsearch')

/**
 * Searches up and prints the top result of a search query.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {String} userId The ID of the user who requested the search.
 * @param {String[]} args The search query.
 */
function search (guildClient, userId, args) {
  const logger = guildClient.logger.child({ user: userId })
  logger.info('Received search command')
  if (!args || args.length === 0) {
    logger.debug('No query found')
    Functions.sendMsg(guildClient.textChannel, `${Emojis.error} ***I need something to search up!***`, guildClient)
    return
  }

  const query = args.join(' ')
  Functions.sendMsg(guildClient.textChannel, `${Emojis.search} ***Searching*** \`${query}\``, guildClient)

  logger.debug(`Searching up ${query}`)
  Gsearch.search(query, result => {
    logger.debug('Received result')
    logger.debug(result)
    guildClient.guild.members.fetch(userId)
      .then(member => {
        Functions.sendMsg(guildClient.textChannel, Embeds.createSearchEmbed(result, member.displayName), guildClient)
      })
  })
}

module.exports = {
  name: 'search',
  execute: search
}
