const { Emojis } = require('../../config')
const Embeds = require('../../bot-util/Embeds')
const Gsearch = require('../../web-apis/Gsearch')

/**
 * Searches up and prints the top result of a search query.
 *
 * @param {import('../../structures/MemberClient')} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args The search query.
 * @param {import('discord.js').Message?} msg The sent message.
 */
function search (memberClient, args, msg) {
  const channel = msg ? msg.channel : undefined
  const logger = memberClient.logger
  logger.info('Received search command')
  if (!args || args.length === 0) {
    logger.debug('No query found')
    memberClient.guildClient.sendMsg(
      `${Emojis.error} ***I need something to search up!***`,
      channel
    )
    return
  }

  const query = args.join(' ')
  memberClient.guildClient.sendMsg(
    `${Emojis.search} ***Searching*** \`${query}\``,
    channel
  )

  logger.debug('Searching up %s', query)
  Gsearch.search(query, result => {
    logger.debug('Received result')
    logger.debug(result)
    memberClient.guildClient.sendMsg(
      Embeds.createSearchEmbed(
        result,
        memberClient.member.displayName
      ),
      channel
    )
  })
}

module.exports = {
  name: 'search',
  form: 'search <search terms>',
  description: 'Searches up and tells you the first result of a query.',
  execute: search
}
