const Defaults = require('defaults')
const { SettingsValues, Emojis } = require('./config')

/**
 * Contains all available settings options for a user.
 *
 * @property {boolean} impressions Whether the impression system is in use.
 * @property {Number} sensitivity The sensitivity of voice commands.
 */
class UserSettings {
  /**
   * Initializes all UserSettings values from defaults or from the options.
   *
   * @param {String} usrId The ID of the user these settings are applied to.
   * @param {Object} options The properties to pass in to the UserSettings object.
   */
  constructor (usrId, options) {
    this.userId = usrId
    options = Defaults(options, {
      impressions: SettingsValues.DEFAULT_IMPRESSIONS,
      sensitivity: SettingsValues.DEFAULT_SENSITIVITY
    })

    Object.assign(this, options)
  }

  /**
   * Saves this Settings object to the Keyv database as a JSON object.
   *
   * @param {Keyv} db The Keyv database to save to.
   */
  save (db) {
    db.set(`${this.userId}:settings`, JSON.stringify(this))
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
      case 'impressions':
        if (value === 'true' || value === 'false') {
          oldVal = this.impressions
          this.impressions = value === 'true'
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
   * Loads and returns a UserSettings object from the database.
   *
   * @static
   * @param {Keyv} db The Keyv database to load from.
   * @param {String} key The key of the UserSettings object.
   * @returns {UserSettings} Returns the UserSettings or default settings if the key is not found.
   */
  static async load (db, key) {
    const obj = await db.get(`${key}:settings`)
    return new UserSettings(key, JSON.parse(obj || '{}'))
  }
}

UserSettings.descriptions = {
  impressions: settings => `${Emojis.settings} **Whether the impressions system is in use. Current value: \`${settings.impressions}\`**`,
  sensitivity: settings => `${Emojis.settings} **The sensitivity of the voice activation. Current value: \`${settings.sensitivity}\`**`
}

UserSettings.names = [
  ['Impressions', 'impressions'],
  ['Sensitivity', 'sensitivity']
]

module.exports = UserSettings
