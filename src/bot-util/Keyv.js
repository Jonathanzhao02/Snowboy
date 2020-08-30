const fs = require('fs')
const Keyv = require('keyv')

const defaultDbdir = require('../config').Paths.defaultDbdir
const defaultDbtest = defaultDbdir + '/testing.db'
const defaultDbprod = defaultDbdir + '/snowboy.db'

if (!fs.existsSync(defaultDbdir)) {
  fs.mkdirSync(defaultDbdir)
}

if (!fs.existsSync(defaultDbtest)) {
  fs.openSync(defaultDbtest, 'a')
}

if (!fs.existsSync(defaultDbprod)) {
  fs.openSync(defaultDbprod, 'a')
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

async function setImpression (id, val) {
  return await uKeyv.set(`${id}:impression`, val)
}

async function getImpression (id) {
  return await uKeyv.get(`${id}:impression`)
}

async function saveUserSettings (id, val) {
  return await uKeyv.set(`${id}:settings`, JSON.stringify(val))
}

async function loadUserSettings (id) {
  return await uKeyv.get(`${id}:settings`)
}

async function saveGuildSettings (id, val) {
  return await gKeyv.set(`${id}:settings`, JSON.stringify(val))
}

async function loadGuildSettings (id) {
  return await gKeyv.get(`${id}:settings`)
}

async function clearAll () {
  await uKeyv.clear()
  await gKeyv.clear()
}

module.exports = {
  clearAll: clearAll,
  setImpression: setImpression,
  getImpression: getImpression,
  saveUserSettings: saveUserSettings,
  loadUserSettings: loadUserSettings,
  saveGuildSettings: saveGuildSettings,
  loadGuildSettings: loadGuildSettings
}
