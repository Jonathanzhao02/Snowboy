module.exports = function (Common) {
  const env = require('dotenv').config({ path: Common.defaultEnvdir + '/.env' })
  if (env.error) throw env.error
}
