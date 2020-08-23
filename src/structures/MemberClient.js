const Common = require('../bot-util/Common')
const { Timeouts } = require('../config')

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
   * The ID of the timeout interval function.
   * @type {Number?}
   */
  this.timeoutId = null

  /**
   * The timestamp of last activity (voice, command).
   * @type {Number}
   */
  this.lastCalled = Date.now() - 2000

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
  return this.guildClient.sendMsg(channel, this.userClient.getResponse(func))
}

/**
 * Ends the listening SnowClient, if it exists.
 */
MemberClient.prototype.stopListening = function () {
  this.logger.debug('Stopping SnowClient')
  this.snowClient?.stop() // eslint-disable-line no-unused-expressions
  this.snowClient = null
}

/**
 * Starts timeout for cleanup.
 */
MemberClient.prototype.startTimeout = function () {
  this.logger.debug('Starting timeout')
  this.lastCalled = Date.now()
  if (this.timeoutId) Common.botClient.clearTimeout(this.timeoutId)
  this.timeoutId = Common.botClient.setTimeout(() => { this.cleanUp() }, Timeouts.MEMBER_TIMEOUT + 500)
}

/**
 * Cleans up and dereferences this MemberClient.
 */
MemberClient.prototype.cleanUp = function () {
  if (Date.now() - this.lastCalled >= Timeouts.MEMBER_TIMEOUT) {
    this.logger.info('Cleaning up')
    this.stopListening()
    this.guildClient.memberClients.delete(this.id)
  }
}

module.exports = MemberClient
