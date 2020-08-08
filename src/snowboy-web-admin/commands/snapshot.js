const Common = require('../../bot-util/Common')
const heapdump = require('heapdump')

/**
 * Takes a snapshot of the heap and writes it to the logs folder.
 *
 * @param {String[]?} args The name of the file.
 */
function snapshot (args) {
  Common.logger.info('Taking heap snapshot!')
  heapdump.writeSnapshot(Common.defaultLogdir + `/${args ? args[0] : new Date().toISOString()}.heapdump`, (err, filename) => {
    if (err) throw err
    Common.logger.info('Saved heap snapshot to %s!', filename)
  })
}

module.exports = {
  name: 'snapshot',
  execute: snapshot
}
