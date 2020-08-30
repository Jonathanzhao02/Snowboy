const { Paths } = require('../../config')
const heapdump = require('heapdump')

/**
 * Takes a snapshot of the heap and writes it to the logs folder.
 *
 * @param {String[]} args The name of the file.
 * @param {import('discord.js').Client} bot The bot's client.
 * @param {import('pino')} logger The logger to use.
 */
function snapshot (args, bot, logger) {
  logger.info('Taking heap snapshot!')
  heapdump.writeSnapshot(Paths.defaultLogdir + `/${args[0] ? args[0] : new Date().toISOString()}.heapsnapshot`, (err, filename) => {
    if (err) throw err
    logger.info('Saved heap snapshot to %s!', filename)
  })
}

module.exports = {
  name: 'snapshot',
  execute: snapshot
}
