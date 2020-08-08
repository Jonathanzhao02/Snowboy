const Keyv = require('keyv')
const Fs = require('fs')

module.exports = function (Common) {
  const defaultDbdir = Common.defaultDbdir
  const defaultDbtest = defaultDbdir + '/testing.db'
  const defaultDbprod = defaultDbdir + '/snowboy.db'

  if (!Fs.existsSync(defaultDbdir)) {
    Fs.mkdirSync(defaultDbdir)
  }

  if (!Fs.existsSync(defaultDbtest)) {
    Fs.openSync(defaultDbtest, 'a')
  }

  if (!Fs.existsSync(defaultDbprod)) {
    Fs.openSync(defaultDbprod, 'a')
  }

  // Create database connections
  const gKeyv = new Keyv(
    process.argv.includes('-t') || process.argv.includes('--testing') ? `sqlite://${defaultDbtest}` : `sqlite://${defaultDbprod}`,
    { table: 'guilds' })
  const uKeyv = new Keyv(
    process.argv.includes('-t') || process.argv.includes('--testing') ? `sqlite://${defaultDbtest}` : `sqlite://${defaultDbprod}`,
    { table: 'users' })
  gKeyv.on('error', error => { throw error })
  uKeyv.on('error', error => { throw error })

  Common.set('gKeyv', gKeyv)
  Common.set('uKeyv', uKeyv)
}
