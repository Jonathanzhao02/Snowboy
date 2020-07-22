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
  guildClient.logger.info('Received search command')
  if (!args || args.length === 0) {
    guildClient.logger.debug('No query found')
    Functions.sendMsg(guildClient.textChannel, `${Emojis.error} ***I need something to search up!***`, guildClient)
    return
  }

  Functions.sendMsg(guildClient.textChannel, `${Emojis.search} ***Searching*** \`${args.join(' ')}\``, guildClient)

  guildClient.logger.debug(`Searching up ${args.join(' ')}`)
  Gsearch.search(args.join(' '), result => {
    guildClient.logger.debug('Received result')
    guildClient.logger.debug(result)
    guildClient.guild.members.fetch(userId)
      .then(user => {
        Functions.sendMsg(guildClient.textChannel, Embeds.createSearchEmbed(result, user.username), guildClient)
      })
  })
}

module.exports = {
  name: 'search',
  execute: search
}
