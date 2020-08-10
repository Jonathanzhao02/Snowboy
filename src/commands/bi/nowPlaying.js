const Embeds = require('../../bot-util/Embeds')
const { Emojis } = require('../../config')

/**
 * Sends the help embed about Snowboy to a user.
 *
 * @param {import('../../structures/MemberClient')} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args The specific command to ask about.
 * @param {import('discord.js').Message} msg Unused parameter.
 */
function nowPlaying (memberClient, args, msg) {
  const logger = memberClient.logger
  logger.info('Received now playing command')
  const video = memberClient.guildClient.guildPlayer.ytHelper[0]
  if (video && memberClient.guildClient.playing) {
    memberClient.guildClient.sendMsg(Embeds.createVideoEmbed(video))
  } else {
    memberClient.guildClient.sendMsg(`${Emojis.error} ***Nothing currently playing!***`)
  }
}

module.exports = {
  name: 'nowplaying',
  form: 'nowplaying',
  description: 'Lists out what\'s currently playing.',
  execute: nowPlaying
}
