const Fs = require('fs')
const Path = require('path')

module.exports = function (client, logger) {
  Fs.readdirSync(Path.resolve(__dirname, './events')).filter(file => file.endsWith('.js')).forEach(filename => {
    require(`./events/${filename}`)(client, logger)
  })
}
