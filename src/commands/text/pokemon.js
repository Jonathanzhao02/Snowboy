const PokeApi = require('../../web-apis/PokeApiV2')
const Embeds = require('../../bot-util/Embeds')
const Strings = require('../../bot-util/Strings')
const { Emojis } = require('../../config')

/**
 * Prints an embed about a Pokemon.
 *
 * @param {import('../../structures/CommandContext')} context The command context.
 */
function pokemon (context) {
  const logger = context.logger
  logger.info('Received pokemon command')
  const name = context.args.join(' ')
  const query = Strings.closestPokemon(name).toLowerCase()
  context.sendMsg(
    query === name ? `${Emojis.search} ***Searching*** \`${query}\`` : `${Emojis.confused} ***I think you meant*** \`${query}\`...`
  )
  PokeApi.get(query).then(pokemon => {
    context.sendMsg(
      Embeds.createPokemonEmbed(pokemon)
    )
  }).catch(err => {
    logger.error(err)
    context.sendMsg(
      `${Emojis.error} *Could not find ${query}...*`
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
