module.exports = function (client, logger) {
  // Logs that the client is ready in console
  client.on('ready', () => {
    logger.info('Started up at %s', new Date().toString())
    logger.info('Logged in as %s', client.user.tag)
    logger.info(`Currently in ${client.guilds.cache.size} guilds!`)
  })
}
