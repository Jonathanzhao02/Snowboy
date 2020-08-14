const Common = require('../bot-util/Common')

/**
 * Wrapper object for a GuildMember so the bot is more easily able to access related resources.
 *
 * @param {import('discord.js').GuildMember} member The GuildMember this MemberClient is tracking.
 * @param {import('./GuildClient')} guildClient The GuildClient this MemberClient is a child to.
 */
function MemberClient (member, guildClient) {
  guildClient.logger.info('Creating new member construct for %s', member.displayName)

  /**
   * The ID of the GuildMember associated with this MemberClient.
   * @type {String}
   */
  this.id = member.id

  /**
   * The SnowClient listening to this MemberClient.
   * @type {import('./SnowClient')?}
   */
  this.snowClient = null

  /**
   * The GuildMember associated with this MemberClient.
   * @type {import('discord.js').GuildMember}
   */
  this.member = member

  /**
   * The UserClient associated with this MemberClient.
   * @type {import('./UserClient')}
   */
  this.userClient = Common.botClient.userClients.get(member.id)

  /**
   * The GuildClient associated with this Member Client.
   * @type {import('./GuildClient')}
   */
  this.guildClient = guildClient

  /**
   * The logger used for logging.
   * @type {import('pino')}
   */
  this.logger = guildClient.logger.child({ member: member.id, name: member.displayName })

  this.logger.debug(this)
}

/**
 * Initializes any database-related values and adds the MemberClient to the GuildClient's memberClients Map.
 */
MemberClient.prototype.init = async function () {
  this.guildClient.memberClients.set(this.id, this)
}

/**
 * Sends the response of Snowboy to a User's command according to their impression.
 *
 * @param {String} func The name of the called command.
 * @param {import('discord.js').TextChannel?} channel The TextChannel to send the response through.
 * @returns {Promise<import('discord.js').Message[] | import('discord.js').Message>} Returns a promise for the sent messages.
 */
MemberClient.prototype.sendResponse = function (func, channel) {
  return this.guildClient.sendMsg(this.userClient.getResponse(func), channel)
}

module.exports = MemberClient
