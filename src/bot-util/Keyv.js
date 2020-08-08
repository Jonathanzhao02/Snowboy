const { gKeyv, uKeyv } = require('./Common')

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
