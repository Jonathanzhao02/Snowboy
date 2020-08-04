const Discord = require('discord.js')
const UserClient = require('../structures/UserClient')
const GuildClient = require('../structures/GuildClient')
const MemberClient = require('../structures/MemberClient')
const Common = require('./Common')
const Functions = require('./Functions')
const { Timeouts, Emojis } = require('../config')

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
  Common.logger.info('Fetching clients for %s', member.displayName)
  // Get the userClient
  const userClient = Common.botClient.userClients.get(member.id)
  if (!userClient) Common.logger.warn('No userClient found for %s!', member.displayName)

  // Get the guildClient
  const guildClient = Common.botClient.guildClients.get(member.guild.id)
  if (!guildClient) Common.logger.warn('No guildClient found for %s!', member.guild.name)

  // Get the memberClient
  const memberClient = guildClient.memberClients.get(userClient.id)
  if (!memberClient) Common.logger.warn('No memberClient found for %s!', member.displayName)

  return {
    userClient: userClient,
    guildClient: guildClient,
    memberClient: memberClient
  }
}

/**
 * Creates or fetches existing clients for a GuildMember/User object.
 *
 * Only returns the UserClient if object is a User.
 * Otherwise, returns the userClient, guildClient, and memberClient.
 *
 * @param {Discord.GuildMember | Discord.User} member The member to fetch all information from.
 * @returns {Object} Returns an Object containing all three clients.
 */
async function createClientsFromMember (member) {
  Common.logger.info('Fetching clients for user %s', member.id)
  // Create a new userConstruct if the User is not currently tracked, loading settings from database
  let userClient = Common.botClient.userClients.get(member.id)
  if (!userClient) {
    userClient = new UserClient(member.user ? member.user : member)
    await userClient.init()
  }

  // If member is a User (no Guild associated), only return the userClient
  if (!member.guild) return { userClient: userClient }

  // Create a new guildConstruct if the Guild is not currently tracked, loading settings from database
  let guildClient = Common.botClient.guildClients.get(member.guild.id)
  if (!guildClient) {
    guildClient = new GuildClient(member.guild)
    await guildClient.init()
  }

  // Create a new memberConstruct if the GuildMember is not currently tracked, loading settings from database
  let memberClient = guildClient.memberClients.get(userClient.id)
  if (!memberClient) {
    memberClient = new MemberClient(member, guildClient)
    await memberClient.init()
  }

  return {
    userClient: userClient,
    guildClient: guildClient,
    memberClient: memberClient
  }
}

/**
 * Starts the timeout for cleanup of a guildClient.
 *
 * @param {Object} guildClient The guildClient to begin timing out.
 */
function startTimeout (guildClient) {
  guildClient.logger.info('Starting expiration timer')
  guildClient.lastCalled = Date.now()
  if (guildClient.timeoutId) clearTimeout(guildClient.timeoutId)
  guildClient.timeoutId = setTimeout(() => { cleanupGuildClient(guildClient) }, Timeouts.TIMEOUT + 500)
}

/**
 * Deletes a guildClient if it has been inactive for a certain amount of time.
 *
 * If the guildClient has an active voice connection, notify through the TextChannel and mark the guildClient
 * for deletion to be handled by the voiceStateUpdate event before leaving the voice channel.
 *
 * @param {Object} guildClient The guildClient to be checked for expiration.
 */
function cleanupGuildClient (guildClient) {
  if (Date.now() - guildClient.lastCalled >= Timeouts.GUILD_TIMEOUT) {
    guildClient.logger.debug('Attempting to clean up guildClient')
    // If the guild is currently connected, is not playing music, and has an active TextChannel,
    // notify, mark the guildClient for deletion, and leave
    if (guildClient.textChannel && guildClient.connection && !guildClient.playing) {
      guildClient.logger.debug('Leaving voice channel')
      Functions.sendMsg(guildClient.textChannel,
        `${Emojis.happy} **It seems nobody needs me right now, so I'll be headed out. Call me when you do!**`,
        guildClient)
      guildClient.delete = true
      guildClient.voiceChannel.leave()
    } else {
      guildClient.logger.debug('Deleting guildClient')
      Common.botClient.guildClients.delete(guildClient.guild.id)
    }
  }
}

module.exports = {
  checkTextPermissions: checkTextPermissions,
  checkVoicePermissions: checkVoicePermissions,
  getClientsFromMember: getClientsFromMember,
  createClientsFromMember: createClientsFromMember,
  startTimeout: startTimeout,
  cleanupGuildClient: cleanupGuildClient
}
