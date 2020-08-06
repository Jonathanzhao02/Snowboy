const Path = require('path')

module.exports = function (Common) {
  const defaultLogdir = Path.resolve(__dirname, '../logs')
  Common.set('defaultLogdir', defaultLogdir)

  const defaultDbdir = Path.resolve(__dirname, '../db')
  Common.set('defaultDbdir', defaultDbdir)
}
