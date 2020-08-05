const Keyv = require('keyv')
const Fs = require('fs')
const Path = require('path')

module.exports = function (Common) {
  const defaultDbdir = Path.resolve(__dirname, '../db')
  const defaultDbtest = Path.resolve(__dirname, '../db/testing.db')
  const defaultDbprod = Path.resolve(__dirname, '../db/snowboy.db')

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