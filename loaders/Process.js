const heapdump = require('heapdump')
const Functions = require('../bot-util/Functions')
const { Emojis } = require('../config')

module.exports = function (Common) {
  // On uncaught exception
  process.on('uncaughtException', error => {
    console.log('UNCAUGHT EXCEPTION: Exiting')
    console.log(error)
    heapdump.writeSnapshot(`./logs/${new Date().toISOString()}_ERR.heapdump`, (err, filename) => {
      Common.logger.error('Uncaught exception')
      Common.logger.error(error)
      Common.botClient.destroy()
      if (err) process.exit(1)
      Common.logger.debug('Heapdump written to %s', filename)
      process.exit(1)
    })
  })

  // On unhandled promise rejection
  process.on('unhandledRejection', (error, promise) => {
    console.log('UNHANDLED REJECTION: Exiting')
    console.log(error)
    console.log(promise)
    heapdump.writeSnapshot(`./logs/${new Date().toISOString()}_REJ.heapdump`, (err, filename) => {
      Common.logger.error('Unhandled promise rejection')
      Common.logger.error(promise)
      Common.logger.error(error)
      Common.botClient.destroy()
      if (err) process.exit(1)
      Common.logger.debug('Heapdump written to %s', filename)
      process.exit(1)
    })
  })

  // On process termination (exits normally)
  process.on('SIGTERM', signal => {
    console.log('Received SIGTERM signal')
    Common.logger.info(`Process ${process.pid} received a SIGTERM signal`)
    Common.botClient.destroy()
    process.exit(0)
  })

  // On process interrupt
  process.on('SIGINT', signal => {
    console.log('Received SIGINT signal')
    Common.logger.info(`Process ${process.pid} has been interrupted`)
    const promise = new Promise((resolve, reject) => {
      const guilds = Array.from(Common.botClient.guildClients)
      Functions.forEachAsync(guilds, async (pair, index, array) => {
        if (pair[1]) pair[1].logger.debug('Sending interrupt message')
        await pair[1].sendMsg(
          `${Emojis.joyful} ***Sorry, I'm going down for updates and maintenance! See you soon!***`
        )
        if (index === array.length - 1) resolve()
      })

      if (guilds.length === 0) resolve()
    })

    promise.then(() => {
      Common.botClient.destroy()
      process.exit(0)
    })
  })
}