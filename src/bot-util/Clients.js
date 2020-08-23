const UserClient = require('../structures/UserClient')
const GuildClient = require('../structures/GuildClient')
const MemberClient = require('../structures/MemberClient')

/**
 * Creates or fetches existing clients for a GuildMember/User object.
 *
 * Only returns the UserClient if object is a User.
 * Otherwise, returns the userClient, guildClient, and memberClient.
 *
 * @param {import('discord.js').GuildMember | import('discord.js').User} member The member to fetch all information from.
 * @param {import('discord.js').Client} bot The bot's client.
 * @param {import('pino')} logger The logger to use for each client.
 * @returns {Object} Returns an Object containing all three clients.
 */
async function createClientsFromMember (member, bot, logger) {
  // Create a new userConstruct if the User is not currently tracked, loading settings from database
  let userClient = bot.userClients.get(member.id)
  if (!userClient) {
    userClient = new UserClient(member.user ? member.user : member, logger)
    await userClient.init()
  }

  // If member is a User (no Guild associated), only return the userClient
  if (!member.guild) return { userClient: userClient }

  // Create a new guildConstruct if the Guild is not currently tracked, loading settings from database
  let guildClient = bot.guildClients.get(member.guild.id)
  if (!guildClient) {
    guildClient = new GuildClient(member.guild, logger)
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

module.exports = {
  createClientsFromMember: createClientsFromMember
}
