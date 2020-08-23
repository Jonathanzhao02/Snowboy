module.exports = function () {
  const env = require('dotenv').config({ path: require('../config').Paths.defaultEnvdir + '/.env' })
  if (env.error) throw env.error
}
