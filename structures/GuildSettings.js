const Defaults = require('defaults')
const { SettingsValues, Emojis } = require('../config')

/**
 * Contains all available settings options for a guildClient.
 *
 * @property {String} prefix The prefix for commands.
 * @property {boolean} voice Whether voice commands are enabled.
 * @property {boolean} mentions Whether mentions are enabled.
 */
class GuildSettings {
  /**
   * Initializes all GuildSettings values from defaults or from the options.
   *
   * @param {String} gldId The ID of the guild these settings are applied to.
   * @param {Object} options The properties to pass in to the GuildSettings object.
   */
  constructor (gldId, options) {
    this.guildId = gldId
    options = Defaults(options, {
      prefix: SettingsValues.DEFAULT_BOT_PREFIX,
      voice: SettingsValues.DEFAULT_VOICE,
      mentions: SettingsValues.DEFAULT_MENTIONS
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
      default:
        return `${Emojis.error} ***\`${name}\` is not an option!***`
    }
    this.save(db)
    return `${Emojis.checkmark} **Changed \`${name}\` from \`${oldVal}\` to \`${value}\`**\n*Please note some changes (i.e. sensitivity) require Snowboy to rejoin to take effect!*`
  }

  /**
   * Loads and returns a GuildSettings object from the database.
   *
   * @static
   * @param {Keyv} db The Keyv database to load from.
   * @param {String} key The key of the GuildSettings object.
   * @returns {GuildSettings} Returns the GuildSettings or default settings if the key is not found.
   */
  static async load (db, key) {
    const obj = await db.get(`${key}:settings`)
    return new GuildSettings(key, JSON.parse(obj || '{}'))
  }
}

GuildSettings.descriptions = {
  prefix: settings => `${Emojis.settings} **The prefix for Snowboy. Current value: \`${settings.prefix}\`**`,
  voice: settings => `${Emojis.settings} **Whether voice commands are in use. Current value: \`${settings.voice}\`**`,
  mentions: settings => `${Emojis.settings} **Whether Snowboy uses mentions in its responses. Current value: \`${settings.mentions}\`**`
}

GuildSettings.names = [
  ['Prefix', 'prefix'],
  ['Voice', 'voice'],
  ['Mentions', 'mentions']
]

module.exports = GuildSettings
