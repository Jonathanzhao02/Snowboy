const Common = require('../../bot-util/Common')
const Discord = require('discord.js')

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
        chan.send('**SYSTEM BROADCAST: **' + msg, { split: true }).catch(() => Common.logger.debug('Could not send broadcast to %s', guild.name))
      } else {
        let textChannel
        guild.channels.cache.forEach(val => {
          if (!textChannel && val instanceof Discord.TextChannel) {
            textChannel = val
            console.log(val.name)
          }
        })
        if (textChannel) textChannel.send('**SYSTEM BROADCAST: **' + msg, { split: true }).catch(() => Common.logger.debug('Could not send broadcast to %s', guild.name))
      }
    }
  })
}

module.exports = {
  name: 'broadcast',
  execute: broadcast
}
