const UserSettings = require('./UserSettings')
const Common = require('../bot-util/Common')
const Keyv = require('../bot-util/Keyv')
const Impressions = require('../bot-util/Impressions')

/**
 * Wrapper object for a User so that the bot can easily access all necessary resources.
 *
 * @param {import('discord.js').User} user The User this UserClient is tracking.
 */
function UserClient (user) {
  Common.logger.info('Creating user construct for %s', user.username)

  /**
   * The ID of the User associated with this UserClient.
   * @type {String}
   */
  this.id = user.id

  /**
   * The timestamp of the User's last logged report.
   * @type {Number}
   */
  this.lastReport = 0

  /**
   * The User associated with this UserClient.
   * @type {import('discord.js').User}
   */
  this.user = user

  /**
   * The UserSettings of this UserClient.
   * @type {import('./UserSettings')?}
   */
  this.settings = null

  /**
   * The User's impression level with Snowboy.
   * @type {Number?}
   */
  this.impression = null

  /**
   * The logger used for logging.
   * @type {import('pino')}
   */
  this.logger = Common.logger.child({ user: user.id, name: user.username })

  this.logger.debug(this)
}

/**
 * Initializes all database-related values and adds the UserClient to the userClients Map.
 */
UserClient.prototype.init = async function () {
  this.logger.info('Initializing UserClient')
  this.logger.debug('Loading settings')
  this.settings = await UserSettings.load(this.id)
  this.logger.debug('Read settings as %o', this.settings)

  this.logger.debug('Loading impression')
  this.impression = await Keyv.getImpression(this.id) || 0
  this.logger.debug('Read impression as %d', this.impression)
  Common.botClient.userClients.set(this.id, this)
}

/**
 * Returns the response to a command according to the User's impression level with Snowboy.
 *
 * @param {String} func The name of the called command.
 * @returns {String} Returns the response.
 */
UserClient.prototype.getResponse = function (func) {
  return Impressions.getResponse(func, this.impression, [`<@${this.id}>`], this.settings.impressions)
}

/**
 * Updates the impression of the UserClient by the sent value.
 *
 * @param {Number} value The amount to update the impression by.
 */
UserClient.prototype.updateImpression = function (value) {
  Impressions.updateImpression(this.id, this, value, this.settings.impressions)
}

module.exports = UserClient