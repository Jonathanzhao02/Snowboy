const Defaults = require('defaults')
const Emojis = require('./emojis')
const Config = require('./config')

/**
 * Contains all available Settings options for a guildClient.
 *
 * @property {String} prefix The prefix for commands.
 * @property {boolean} impressions Whether the impression system is being used.
 * @property {boolean} voice Whether voice commands are enabled.
 * @property {boolean} mentions Whether mentions are enabled.
 * @property {String} sensitivity The sensitivity of voice commands.
 */
class Settings {
  /**
   * Initializes all Settings values from defaults or from the options.
   *
   * @param {String} gldId The ID of the guild these Settings are applied to.
   * @param {Object} options The properties to pass in to the Settings object.
   */
  constructor (gldId, options) {
    this.guildId = gldId
    options = Defaults(options, {
      prefix: Config.SettingsValues.DEFAULT_BOT_PREFIX,
      impressions: Config.SettingsValues.DEFAULT_IMPRESSIONS,
      voice: Config.SettingsValues.DEFAULT_VOICE,
      mentions: Config.SettingsValues.DEFAULT_MENTIONS,
      sensitivity: Config.SettingsValues.DEFAULT_SENSITIVITY
    })

    Object.assign(this, options)
  }

  /**
   * Saves this Settings object to the Keyv database as a JSON object.
   *
   * @param {Keyv} db The Keyv database to save to.
   */
  save (db) {
    db.set(`${this.guildId}:settings`, JSON.stringify(this))
  }

  /**
   * Sets the value of a property in this Settings object and returns a response.
   *
   * Checks that all values are valid before assigning them.
   *
   * @param {Keyv} db The Keyv database to save to.
   * @param {String} name The name of the property being set.
   * @param {String} value The new value of the property.
   * @returns {String} Returns the response to the Settings change.
   */
  set (db, name, value) {
    let oldVal
    switch (name) {
      case 'prefix':
        if (value.length < 10) {
          oldVal = this.prefix
          this.prefix = value
        } else {
          return `${Emojis.error} ***Please keep prefix length to below 10 characters!***`
        }
        break
      case 'impressions':
        if (value === 'true' || value === 'false') {
          oldVal = this.impressions
          this.impressions = value === 'true'
        } else {
          return `${Emojis.error} ***Value can only be \`true\` or \`false\`!***`
        }
        break
      case 'voice':
        if (value === 'true' || value === 'false') {
          oldVal = this.voice
          this.voice = value === 'true'
        } else {
          return `${Emojis.error} ***Value can only be \`true\` or \`false\`!***`
        }
        break
      case 'mentions':
        if (value === 'true' || value === 'false') {
          oldVal = this.mentions
          this.mentions = value === 'true'
        } else {
          return `${Emojis.error} ***Value can only be \`true\` or \`false\`!***`
        }
        break
      case 'sensitivity':
        if (!isNaN(value) && value >= 0 && value <= 1) {
          oldVal = this.sensitivity
          this.sensitivity = value
        } else {
          return `${Emojis.error} ***Value must be a number between 0 and 1!***`
        }
        break
      default:
        return `${Emojis.error} ***\`${name}\` is not an option!***`
    }
    this.save(db)
    return `${Emojis.checkmark} **Changed \`${name}\` from \`${oldVal}\` to \`${value}\`**\n*Please note some changes (i.e. sensitivity) require Snowboy to rejoin to take effect!*`
  }

  /**
   * Loads and returns a Settings object from the database.
   *
   * @static
   * @param {Keyv} db The Keyv database to load from.
   * @param {String} gldId The guild ID of the Settings object.
   * @returns {Settings} Returns the Settings or undefined if the guild is not found.
   */
  static async load (db, gldId) {
    const obj = await db.get(`${gldId}:settings`)
    return obj ? Object.assign(new Settings(gldId), JSON.parse(obj)) : obj
  }
}

Settings.descriptions = {
  prefix: settings => `${Emojis.settings} **The prefix for Snowboy. Current value: \`${settings.prefix}\`**`,
  impressions: settings => `${Emojis.settings} **Whether the impressions system is in use. Current value: \`${settings.impressions}\`**`,
  voice: settings => `${Emojis.settings} **Whether voice commands are in use. Current value: \`${settings.voice}\`**`,
  mentions: settings => `${Emojis.settings} **Whether Snowboy uses mentions in its responses. Current value: \`${settings.mentions}\`**`,
  sensitivity: settings => `${Emojis.settings} **The sensitivity of the voice activation. Current value: \`${settings.sensitivity}\`**`
}

Settings.names = [
  ['Prefix', 'prefix'],
  ['Impressions', 'impressions'],
  ['Voice', 'voice'],
  ['Mentions', 'mentions'],
  ['Sensitivity', 'sensitivity']
]

module.exports = Settings
