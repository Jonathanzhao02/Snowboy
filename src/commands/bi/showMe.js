const { Emojis } = require('../../config')
const Functions = require('../../bot-util/Functions')
const Embeds = require('../../bot-util/Embeds')

const Imgsearch = require('g-i-s')

/**
 * Searches up and prints the top result of an image search query.
 *
 * @param {import('../../structures/MemberClient')} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args The search query.
 */
function showMe (memberClient, args) {
  const logger = memberClient.logger
  logger.info('Received showme command')
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
  Imgsearch(query, async (error, results) => {
    if (error) throw error

    while (results.length > 0) {
      const result = results.shift()

      try {
        await Functions.validateURL(result.url)
        result.query = query
        logger.debug('Received valid result')
        logger.debug(result)
        memberClient.guildClient.sendMsg(
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
    memberClient.guildClient.sendMsg(
      `${Emojis.error} ***No results found for \`${query}\`!***`
    )
  })
}

module.exports = {
  name: 'showme',
  aliases: ['imagesearch', 'imgsearch'],
  execute: showMe
}