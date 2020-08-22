const Common = require('../../bot-util/Common')

/**
 * Broadcasts a message across all current Guilds.
 *
 * @param {String[]} args The message to braodcast.
 */
function broadcast (args) {
  if (args.length < 1) return
  const msg = args.join(' ')
  Common.logger.info('Broadcasting %s!', msg)
  Common.botClient.guilds.cache.forEach(guild => {
    if (guild.available) {
      let channel = guild.systemChannel
      guild.channels.cache.forEach(c => {
        if (c.type === 'text' && !channel) channel = c
      })
      if (channel) channel.send('**SYSTEM BROADCAST: **' + msg, { split: true }).catch(() => Common.logger.debug('Could not send broadcast to %s', guild.name))
    }
  })
}

module.exports = {
  name: 'broadcast',
  execute: broadcast
}
