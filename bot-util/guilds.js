const Discord = require('discord.js')
const Common = require('../common')

/**
 * Checks permissions in a TextChannel and returns any missing.
 *
 * @param {Discord.TextChannel} channel The TextChannel where permissions are required.
 * @returns {String[]?} The array of missing text permissions or null if all permissions are granted.
 */
function checkTextPermissions (channel) {
  if (channel.guild.me.hasPermission(Discord.Permissions.FLAGS.ADMINISTRATOR)) return
  const textPermissions = channel.guild.me.permissionsIn(channel)
  const textMissingPermissions = new Discord.Permissions(textPermissions.missing([
    Discord.Permissions.FLAGS.VIEW_CHANNEL,
    Discord.Permissions.FLAGS.SEND_MESSAGES,
    Discord.Permissions.FLAGS.MANAGE_MESSAGES,
    Discord.Permissions.FLAGS.EMBED_LINKS,
    Discord.Permissions.FLAGS.ATTACH_FILES,
    Discord.Permissions.FLAGS.READ_MESSAGE_HISTORY
  ])).toArray()

  if (textMissingPermissions.length > 0) return textMissingPermissions
}

/**
 * Checks permissions in a VoiceChannel and returns any missing.
 *
 * @param {*} channel The VoiceChannel where permissions are required.
 * @returns {String[]?} The array of missing voice permissions or null if all permissions are granted.
 */
function checkVoicePermissions (channel) {
  if (channel) {
    if (channel.guild.me.hasPermission(Discord.Permissions.FLAGS.ADMINISTRATOR)) return
    const voicePermissions = channel.guild.me.permissionsIn(channel)
    const voiceMissingPermissions = new Discord.Permissions(voicePermissions.missing([
      Discord.Permissions.FLAGS.VIEW_CHANNEL,
      Discord.Permissions.FLAGS.CONNECT,
      Discord.Permissions.FLAGS.SPEAK,
      Discord.Permissions.FLAGS.DEAFEN_MEMBERS
    ])).toArray()

    if (voiceMissingPermissions.length > 0) return voiceMissingPermissions
  }
}

/**
 * Gets userClient, guildClient, and memberClient from a GuildMember, if they exist.
 *
 * @param {Discord.GuildMember} member The GuildMember to fetch the clients for.
 * @returns {Object} Returns an object containing all existing clients.
 */
function getClientsFromMember (member) {
  Common.logger.info(`Fetching clients for ${member}`)
  // Get the userClient
  const userClient = Common.botClient.userClients.get(member.id)
  if (!userClient) Common.logger.warn(`No userClient found for ${member.id}!`)

  // Get the guildClient
  const guildClient = Common.botClient.guildClients.get(member.guild.id)
  if (!guildClient) Common.logger.warn(`No guildClient found for ${member.guild.id}!`)

  // Get the memberClient
  const memberClient = guildClient.memberClients.get(userClient.id)
  if (!memberClient) Common.logger.warn(`No memberClient found for ${member.id}!`)

  return {
    userClient: userClient,
    guildClient: guildClient,
    memberClient: memberClient
  }
}

module.exports = {
  checkTextPermissions: checkTextPermissions,
  checkVoicePermissions: checkVoicePermissions,
  getClientsFromMember: getClientsFromMember
}
