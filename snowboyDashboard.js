const ipc = require('node-ipc')

function start () {
  ipc.config.id = 'snowboy'
  ipc.config.retry = 1500
  ipc.config.silent = true
  ipc.serve(() => {
    ipc.server.on('message', message => {
      console.log(message)
    })
  })
  ipc.server.start()
}

module.exports = {
  start: start
}
