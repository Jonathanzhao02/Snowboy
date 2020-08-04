const Keyv = require('keyv')

module.exports = function (Common) {
  // Create database connections
  const gKeyv = new Keyv(
    process.argv.includes('-t') || process.argv.includes('--testing') ? 'sqlite://db/testing.db' : 'sqlite://db/snowboy.db',
    { table: 'guilds' })
  const uKeyv = new Keyv(
    process.argv.includes('-t') || process.argv.includes('--testing') ? 'sqlite://db/testing.db' : 'sqlite://db/snowboy.db',
    { table: 'users' })
  gKeyv.on('error', error => { throw error })
  uKeyv.on('error', error => { throw error })

  Common.set('gKeyv', gKeyv)
  Common.set('uKeyv', uKeyv)
}
