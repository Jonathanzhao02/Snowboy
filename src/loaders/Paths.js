const Path = require('path')

module.exports = function (Common) {
  const defaultLogdir = Path.resolve(__dirname, '../../logs')
  Common.set('defaultLogdir', defaultLogdir)

  const defaultDbdir = Path.resolve(__dirname, '../../db')
  Common.set('defaultDbdir', defaultDbdir)

  const defaultResdir = Path.resolve(__dirname, '../resources')
  Common.set('defaultResdir', defaultResdir)

  const defaultEnvdir = Path.resolve(__dirname, '../..')
  Common.set('defaultEnvdir', defaultEnvdir)
}
