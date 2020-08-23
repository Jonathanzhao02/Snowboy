/**
 * Broadcasts a message across all current Guilds.
 *
 * @param {String[]} args The message to braodcast.
 * @param {import('discord.js').Client} bot The bot's client.
 * @param {import('pino')} logger The logger to use.
 */
function broadcast (args, bot, logger) {
  if (args.length < 1) return
  const msg = args.join(' ')
  logger.info('Broadcasting %s!', msg)
  bot.guilds.cache.forEach(guild => {
    if (guild.available) {
      let channel = guild.systemChannel
      guild.channels.cache.forEach(c => {
        if (c.type === 'text' && !channel) channel = c
      })
      if (channel) channel.send('**SYSTEM BROADCAST: **' + msg, { split: true }).catch(() => logger.debug('Could not send broadcast to %s', guild.name))
    }
  })
}

module.exports = {
  name: 'broadcast',
  execute: broadcast
}
