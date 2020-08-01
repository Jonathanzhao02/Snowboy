const Common = require('./bot-util/Common')
const Discord = require('discord.js')

/**
 * Wrapper object for a GuildMember so the bot is more easily able to access related resources.
 *
 * @property {String} id The ID of the GuildMember this MemberClient is tracking.
 * @property {SnowClient} snowClient The SnowClient listening to this MemberClient's GuildMember.
 * @property {GuildMember} member The GuildMember this MemberClient is tracking.
 * @property {UserClient} userClient The associated UserClient.
 * @property {GuildClient} guildClient The associated guildClient.
 * @property {Object} logger The logger of this MemberClient.
 */
class MemberClient {
  /**
   * Creates a MemberClient object.
   *
   * @param {Discord.GuildMember} member The GuildMember this MemberClient is tracking.
   * @param {GuildClient} guildClient The GuildClient this MemberClient is a child to.
   */
  constructor (member, guildClient) {
    guildClient.logger.info('Creating new member construct for %s', member.displayName)

    this.id = member.id
    this.snowClient = null
    this.member = member
    this.userClient = Common.botClient.userClients.get(member.id)
    this.guildClient = guildClient
    this.logger = guildClient.logger.child({ member: member.id, name: member.displayName })

    this.logger.debug(this)
  }

  /**
   * Initializes any database-related values and adds the MemberClient to the GuildClient's memberClients Map.
   */
  async init () {
    this.guildClient.memberClients.set(this.id, this)
  }
}

module.exports = MemberClient
