const { Timeouts, Emojis } = require('../../config')

module.exports = function (client) {
  client.on('voiceStateUpdate', (oldPresence, newPresence) => {
    // If wasn't previously in a voice channel, ignore
    if (!oldPresence.channel) return
    const guildClient = client.guildClients.get(newPresence.guild.id)
    const userId = newPresence.id

    // If bot is currently connected, the channel in question is the bot's channel, and a user has left or moved channels
    if (guildClient?.connection && oldPresence.channelID === guildClient?.voiceChannel.id &&
      (!newPresence.channelID || newPresence.channelID !== guildClient.voiceChannel.id)) {
      guildClient.logger.info('User %s has left the voice channel', newPresence.member.displayName)

      // If user is being listened to, stop listening
      guildClient.memberClients.get(userId)?.stopListening() // eslint-disable-line no-unused-expressions

      // If the bot has been disconnected, clean up the guildClient
      if (userId === client.user.id && !newPresence.channelID) {
        guildClient.leaveVoiceChannel()
      }

      // If the bot has been left alone in a channel, wait a few seconds before leaving
      if (oldPresence.channel.members.size === 1 && userId !== client.user.id) {
        guildClient.logger.info('Started alone timeout timer')
        client.setTimeout(() => {
          // Check again that the channel exists and is empty before leaving
          if (oldPresence.channel && oldPresence.channel.members.size === 1) {
            guildClient.logger.info('Leaving channel, only member remaining')
            guildClient.sendMsg(
              `${Emojis.sad} **I'm leaving, I'm all by myself!**`
            )
            guildClient.leaveVoiceChannel()
          }
        }, Timeouts.ALONE_TIMEOUT + 500)
      }
    }
  })
}
