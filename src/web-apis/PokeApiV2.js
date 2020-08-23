const http = require('https')
let cache

/**
 * Sets the cache to use for any API responses.
 *
 * @param {import('flat-cache')} cache The cache to use.
 */
function setCache (cch) {
  cache = cch
}

/**
 * Returns endpoint and query from a PokeApi URL.
 *
 * @param {String} url The URL to process.
 * @returns {String[]} Returns the query and the endpoint, in that order.
 */
function processEndpoints (url) {
  const endpoints = url.match(/[^/]+/g)
  return [endpoints.pop(), endpoints.pop()]
}

/**
 * Gets a pokemon information.
 *
 * @param {String} query The pokemon to search up.
 * @param {String} endpoint The API endpoint to search.
 * @returns {Promise<Object>} Returns the results of the search.
 */
function search (query, endpoint) {
  const key = endpoint + ':' + query
  return new Promise((resolve, reject) => {
    if (cache?.getKey(endpoint + ':' + query)) return resolve(cache.getKey(key), key)
    const method = 'GET'
    const host = 'pokeapi.co'
    const path = `/api/v2/${endpoint}/`
    const headers = {
      Accept: 'application/json'
    }

    const options = {
      host: host,
      path: path + query,
      headers: headers,
      method: method
    }

    // Makes HTTP request to Custom Search API
    const req = http.request(options, resp => {
      resp.setEncoding('utf8')
      let message = ''

      resp.on('data', chunk => {
        message += chunk
      })

      resp.on('end', () => {
        if (resp.statusCode !== 200) reject(new Error(`Invalid status code ${resp.statusCode}`))
        else {
          const obj = JSON.parse(message)
          cache?.setKey(key, obj) // eslint-disable-line no-unused-expressions
          resolve(obj, key)
        }
      })
    })
    req.end()
  })
}

/**
 * Gets an array of the next evolutions from a chain.
 *
 * @param {Object} chain The evolution chain to search through.
 * @param {String} name The pokemon name to search for.
 * @returns {String[]} Returns an array of the next evolution names.
 */
function getNextEvos (chain, name) {
  const evoChain = []
  let evoData = chain.chain

  do {
    const numberOfEvolutions = evoData.evolves_to.length

    for (let i = 0; i < numberOfEvolutions; i++) {
      if (evoData.species.name === name) {
        evoData.evolves_to.forEach(val => {
          evoChain.push(val.species.name)
        })

        return evoChain
      }
    }

    evoData = evoData.evolves_to[0]
  } while (evoData && evoData.evolves_to)

  return evoChain
}

/**
 * Gets relevant information about a pokemon.
 *
 * @param {String} query The pokemon to search for.
 * @returns {Object} Returns the object containing all pokemon information.
 */
async function get (query) {
  const pokemon = await search(query, 'pokemon')
  const speciesEndpoints = processEndpoints(pokemon.species.url)
  const species = await search(speciesEndpoints[0], speciesEndpoints[1])
  const chainEndpoints = processEndpoints(species.evolution_chain.url)
  const chain = await search(chainEndpoints[0], chainEndpoints[1])
  const pokemonConstruct = {
    name: query,
    abilities: pokemon.abilities.map(val => val.ability.name),
    types: pokemon.types.map(val => val.type.name),
    stats: pokemon.stats.map(val => { return { name: val.stat.name, ev: val.effort, base: val.base_stat } }),
    sprites: pokemon.sprites,
    evolves_from: species.evolves_from_species?.name,
    evolves_to: getNextEvos(chain, query)
  }

  return pokemonConstruct
}

module.exports = {
  get: get,
  setCache: setCache
}
