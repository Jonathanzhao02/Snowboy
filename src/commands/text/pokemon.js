const PokeApi = require('../../web-apis/PokeApiV2')
const Embeds = require('../../bot-util/Embeds')
const Strings = require('../../bot-util/Strings')
const { Emojis } = require('../../config')

/**
 * Prints an embed about a Pokemon.
 *
 * @param {import('../../structures/MemberClient')} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args The query.
 * @param {import('discord.js').Message} msg The sent message.
 */
function pokemon (memberClient, args, msg) {
  const logger = memberClient.logger
  logger.info('Received pokemon command')
  const name = args.join(' ')
  const query = Strings.closestPokemon(name).toLowerCase()
  memberClient.guildClient.sendMsg(
    query === name ? `${Emojis.search} ***Searching*** \`${query}\`` : `${Emojis.confused} ***I think you meant*** \`${query}\`...`,
    msg.channel
  )
  PokeApi.get(query).then(pokemon => {
    memberClient.guildClient.sendMsg(
      Embeds.createPokemonEmbed(pokemon),
      msg.channel
    )
  }).catch(err => {
    logger.error(err)
    memberClient.guildClient.sendMsg(
      `${Emojis.error} *Could not find ${query}...*`,
      msg.channel
    )
  })
}

module.exports = {
  name: 'pokemon',
  form: 'pokemon <name>',
  description: 'Asks Snowboy about a specific pokemon.',
  usages: ['TEXT', 'GUILD_ONLY'],
  execute: pokemon
}
