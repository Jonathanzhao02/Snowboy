const { Emojis } = require('../../config')

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

      // If user is tracked, start cleanup timeout.
      guildClient.memberClients.get(userId)?.startTimeout() // eslint-disable-line no-unused-expressions

      // If the bot has been left alone in a channel, wait a few seconds before leaving
      if (guildClient.voiceChannel.members.size === 1 && userId !== client.user.id) {
        guildClient.startAloneTimeout()
      }

      // If the bot has been moved
      if (userId === client.user.id && newPresence.channelID !== guildClient.voiceChannel.id) {
        guildClient.sendMsg(`${Emojis.angry} **Don't move me from my home!**`)
        newPresence.channel.leave()
      }
    }
  })
}
