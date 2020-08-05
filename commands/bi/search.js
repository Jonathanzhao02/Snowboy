const { Emojis } = require('../../config')
const Embeds = require('../../bot-util/Embeds')
const Gsearch = require('../../web-apis/Gsearch')

/**
 * Searches up and prints the top result of a search query.
 *
 * @param {import('../../structures/MemberClient')} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args The search query.
 */
function search (memberClient, args) {
  const logger = memberClient.logger
  logger.info('Received search command')
  if (!args || args.length === 0) {
    logger.debug('No query found')
    memberClient.guildClient.sendMsg(
      `${Emojis.error} ***I need something to search up!***`
    )
    return
  }

  const query = args.join(' ')
  memberClient.guildClient.sendMsg(
    `${Emojis.search} ***Searching*** \`${query}\``
  )

  logger.debug('Searching up %s', query)
  Gsearch.search(query, result => {
    logger.debug('Received result')
    logger.debug(result)
    memberClient.guildClient.sendMsg(
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
