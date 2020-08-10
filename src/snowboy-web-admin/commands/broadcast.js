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
      const chan = guild.channels.resolve(guild.systemChannelID)
      if (chan) {
        try {
          chan.send('**SYSTEM BROADCAST: **' + msg, { split: true })
        } catch (error) {
          Common.logger.debug('Could not send broadcast to %s', guild.name)
        }
      }
    }
  })
}

module.exports = {
  name: 'broadcast',
  execute: broadcast
}
