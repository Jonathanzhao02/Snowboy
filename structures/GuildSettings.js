const Defaults = require('defaults')
const { SettingsValues, Emojis } = require('../config')
const Keyv = require('../bot-util/Keyv')

/**
 * Contains all available settings options for a guildClient.
 *
 * @param {String} guildId The ID of the guild these settings are applied to.
 * @param {Object} options The properties to pass in to the GuildSettings object.
 * @param {String?} options.prefix The prefix for commands.
 * @param {Boolean?} options.voice Whether voice commands are enabled.
 * @param {Boolean?} options.mentions Whether mentions are enabled.
 */
function GuildSettings (guildId, options) {
  options = Defaults(options, {
    prefix: SettingsValues.DEFAULT_BOT_PREFIX,
    voice: SettingsValues.DEFAULT_VOICE,
    mentions: SettingsValues.DEFAULT_MENTIONS
  })

  /**
   * The ID of the guild these settings are applied to.
   * @type {String}
   */
  this.guildId = guildId

  /**
   * The prefix for commands.
   * @type {String}
   */
  this.prefix = options.prefix

  /**
   * Whether voice commands are enabled.
   * @type {Boolean}
   */
  this.voice = options.voice

  /**
   * Whether mentions are enabled.
   * @type {Boolean}
   */
  this.mentions = options.mentions
}

/**
 * Saves this Settings object to the Keyv database as a JSON object.
 */
GuildSettings.prototype.save = function (db) {
  Keyv.saveGuildSettings(this.guildId, this)
}

/**
 * Sets the value of a property in this Settings object and returns a response.
 *
 * Checks that all values are valid before assigning them.
 *
 * @param {String} name The name of the property being set.
 * @param {String} value The new value of the property.
 * @returns {String} Returns the response to the Settings change.
 */
GuildSettings.prototype.set = function (name, value) {
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
  this.save()
  return `${Emojis.checkmark} **Changed \`${name}\` from \`${oldVal}\` to \`${value}\`**\n*Please note some changes (i.e. sensitivity) require Snowboy to rejoin to take effect!*`
}

/**
 * Loads and returns a GuildSettings object from the database.
 *
 * @static
 * @param {String} id The ID of the Guild.
 * @returns {GuildSettings} Returns the GuildSettings or default settings if the key is not found.
 */
GuildSettings.load = async function (id) {
  const obj = await Keyv.loadGuildSettings(id)
  return new GuildSettings(id, JSON.parse(obj || '{}'))
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
