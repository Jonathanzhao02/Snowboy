const { Timeouts, Emojis } = require('../../config')

module.exports = function (client) {
  client.on('voiceStateUpdate', (oldPresence, newPresence) => {
    const guildClient = client.guildClients.get(newPresence.guild.id)
    const userId = newPresence.id

    // If bot is currently connected, the channel in question is the bot's channel, and a user has left or moved channels
    if (guildClient && guildClient.connection && oldPresence.channelID === guildClient.voiceChannel.id &&
      (!newPresence.channelID || newPresence.channelID !== guildClient.voiceChannel.id)) {
      guildClient.logger.info('User has left the voice channel')

      // If user is being listened to, stop listening
      if (guildClient.memberClients.get(userId)) {
        guildClient.logger.info('Stopping SnowClient for %s', newPresence.member.displayName)
        const snowClient = guildClient.memberClients.get(userId).snowClient
        if (snowClient) snowClient.stop()
        guildClient.memberClients.get(userId).snowClient = null
      }

      // If the bot has been disconnected, clean up the guildClient
      if (userId === client.user.id && !newPresence.channelID) {
        guildClient.logger.info('Bot disconnected, cleaning up...')
        guildClient.leaveVoiceChannel()
      }

      // If the bot has been left alone in a channel, wait a few seconds before leaving
      if (oldPresence.channel.members.size === 1 && userId !== client.user.id) {
        guildClient.logger.info('Started alone timeout timer')
        setTimeout(() => {
          // Check again that the channel is empty before leaving
          if (oldPresence.channel.members.size === 1) {
            guildClient.logger.info('Leaving channel, only member remaining')
            guildClient.sendMsg(
              `${Emojis.sad} I'm leaving, I'm all by myself!`
            )
            guildClient.leaveVoiceChannel()
          }
        }, Timeouts.ALONE_TIMEOUT + 500)
      }

      // If the bot has disconnected and the guildClient is marked for deletion, delete it
      if (userId === client.user.id && !newPresence.channelID && guildClient.delete) {
        guildClient.logger.info('Deleting guild client')
        client.guildClients.delete(guildClient.id)
      }
    }
  })
}
