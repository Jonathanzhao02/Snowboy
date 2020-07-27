const Emojis = require('../../emojis')
const { Embeds, Functions } = require('../../bot-util')

const Imgsearch = require('g-i-s')

/**
 * Searches up and prints the top result of an image search query.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {String} userId The ID of the user who requested the search.
 * @param {String[]} args The search query.
 */
function showMe (guildClient, userId, args) {
  const logger = guildClient.logger.child({ user: userId })
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
    const result = results[Math.floor(Math.random() * results.length)]
    result.query = query
    logger.debug('Received result')
    logger.debug(result)
    guildClient.guild.members.fetch(userId)
      .then(member => {
        Functions.sendMsg(guildClient.textChannel, Embeds.createImageEmbed(result, member.displayName), guildClient)
      })
  })
}

module.exports = {
  name: 'showme',
  execute: showMe
}
