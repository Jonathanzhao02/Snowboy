const UserSettings = require('../UserSettings')
const Common = require('./bot-util/Common')
const Discord = require('discord.js')

/**
 * Wrapper object for a User so that the bot can easily access all necessary resources.
 *
 * @property {String} id The ID of the UserClient's User.
 * @property {Number} lastReport The time of the last user report.
 * @property {Discord.User} user The User this UserClient is tracking.
 * @property {UserSettings} settings The settings of this UserClient.
 * @property {Number} impression The User's impression level with Snowboy.
 * @property {Object} logger The logger used by this UserClient.
 */
class UserClient {
  /**
   * Creates a UserClient object.
   *
   * @param {Discord.User} user The User this UserClient is tracking.
   */
  constructor (user) {
    Common.logger.info('Creating user construct for %s', user.username)

    this.id = user.id
    this.lastReport = 0
    this.user = user
    this.settings = null
    this.impression = null
    this.logger = Common.logger.child({ user: user.id, name: user.username })

    this.logger.debug(this)
  }

  /**
   * Initializes all database-related values and adds the UserClient to the userClients Map.
   */
  async init () {
    this.logger.info('Initializing UserClient')
    this.logger.debug('Loading settings')
    this.settings = await UserSettings.load(Common.uKeyv, this.user.id)
    this.logger.debug('Read settings as %o', this.settings)

    this.logger.debug('Loading impression')
    this.impression = await Common.uKeyv.get(`${this.user.id}:impression`) || 0
    this.logger.debug('Read impression as %d', this.impression)
    Common.botClient.userClients.set(this.guild.id, this)
  }
}

module.exports = UserClient
