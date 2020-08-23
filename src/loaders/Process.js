const heapdump = require('heapdump')
const Functions = require('../bot-util/Functions')
const { Emojis, Paths } = require('../config')

module.exports = function (bot, cache, logger) {
  // On uncaught exception
  process.on('uncaughtException', error => {
    console.log('UNCAUGHT EXCEPTION: Exiting')
    console.log(error)
    heapdump.writeSnapshot(Paths.defaultLogdir + `/${new Date().toISOString()}_ERR.heapdump`, (err, filename) => {
      logger.error('Uncaught exception')
      logger.error(error)
      if (err) process.exit(1)
      logger.debug('Heapdump written to %s', filename)
      process.exit(1)
    })
  })

  // On unhandled promise rejection
  process.on('unhandledRejection', (error, promise) => {
    console.log('UNHANDLED REJECTION: Exiting')
    console.log(error)
    console.log(promise)
    heapdump.writeSnapshot(Paths.defaultLogdir + `/${new Date().toISOString()}_REJ.heapdump`, (err, filename) => {
      logger.error('Unhandled promise rejection')
      logger.error(promise)
      logger.error(error)
      if (err) process.exit(1)
      logger.debug('Heapdump written to %s', filename)
      process.exit(1)
    })
  })

  // On process termination (exits normally)
  process.on('SIGTERM', signal => {
    console.log('Received SIGTERM signal')
    logger.info(`Process ${process.pid} received a SIGTERM signal`)
    process.exit(0)
  })

  // On process interrupt
  process.on('SIGINT', signal => {
    console.log('Received SIGINT signal')
    logger.info(`Process ${process.pid} has been interrupted`)
    const promise = new Promise((resolve, reject) => {
      Functions.forEachAsync(bot.guildClients, async (guildClient) => {
        if (guildClient) guildClient.logger.debug('Sending interrupt message')
        await guildClient.sendMsg(
          guildClient.boundTextChannel,
          `${Emojis.joyful} ***Sorry, I'm going down for updates and maintenance! See you soon!***`
        )
      }).then(resolve)

      if (bot.guildClients.size === 0) resolve()
    })

    promise.then(() => {
      process.exit(0)
    })
  })

  // On process exit
  process.on('exit', () => {
    cache.save()
    bot.destroy()
  })
}
