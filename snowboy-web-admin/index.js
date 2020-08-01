const ipc = require('node-ipc')
const commands = require('./CommandMap')

/**
 * Starts the ipc server for dashboard communication.
 */
function start () {
  ipc.config.id = 'snowboy'
  ipc.config.retry = 1500
  ipc.config.silent = true
  ipc.serve(() => {
    ipc.server.on('message', message => {
      console.log(message)
      const args = message.split(/ +/)
      const commandName = args.shift()
      if (commands.get(commandName)) {
        commands.get(commandName).execute(args)
      }
    })
  })
  ipc.server.start()
}

module.exports = {
  start: start
}
