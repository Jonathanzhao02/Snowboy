const Defaults = require('defaults')
const Emojis = require('./emojis')
const Config = require('./config')

class Settings {
  constructor (gldId, options) {
    this.guildId = gldId
    options = Defaults(options, {
      prefix: Config.DEFAULT_BOT_PREFIX,
      impressions: Config.DEFAULT_IMPRESSIONS,
      voice: Config.DEFAULT_VOICE,
      mentions: Config.DEFAULT_MENTIONS,
      sensitivity: Config.DEFAULT_SENSITIVITY
    })

    this.prefix = options.prefix
    this.impressions = options.impressions
    this.voice = options.voice
    this.mentions = options.mentions
    this.sensitivity = options.sensitivity
  }

  save (db) {
    db.set(`${this.guildId}:settings`, JSON.stringify(this))
  }

  set (db, name, value) {
    switch (name) {
      case 'prefix':
        if (value.length < 10) {
          this.prefix = value
        } else {
          return `${Emojis.error} ***Please keep prefix length to below 10 characters!***`
        }
        break
      case 'impressions':
        if (value === 'true' || value === 'false') {
          this.impressions = value
        } else {
          return `${Emojis.error} ***Value can only be \`true\` or \`false\`!***`
        }
        break
      case 'voice':
        if (value === 'true' || value === 'false') {
          this.voice = value
        } else {
          return `${Emojis.error} ***Value can only be \`true\` or \`false\`!***`
        }
        break
      case 'mentions':
        if (value === 'true' || value === 'false') {
          this.mentions = value
        } else {
          return `${Emojis.error} ***Value can only be \`true\` or \`false\`!***`
        }
        break
      case 'sensitivity':
        if (!isNaN(value) && value >= 0 && value <= 1) {
          this.sensitivity = value
        } else {
          return `${Emojis.error} ***Value must be a number between 0 and 1!***`
        }
        break
      default:
        return `${Emojis.error} ***\`${name}\` is not an option!***`
    }
    this.save(db)
    return `${Emojis.checkmark} **Set \`${name}\` to \`${value}\`**\n*Please note some changes (i.e. sensitivity, voice commands) require Snowboy to rejoin to take effect!*`
  }

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

module.exports = Settings
