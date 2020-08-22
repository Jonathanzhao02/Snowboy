const GuildSettings = require('./GuildSettings')
const Common = require('../bot-util/Common')
const Functions = require('../bot-util/Functions')
const Strings = require('../bot-util/Strings')
const { Timeouts, Emojis } = require('../config')
const { EventEmitter } = require('events')
const GuildPlayer = require('./GuildPlayer')

/**
 * Wrapper object for a Guild so the bot is more easily able to access related resources.
 *
 * @param {import('discord.js').Guild} guild The Guild this GuildClient is tracking.
 */
function GuildClient (guild) {
  Common.logger.info('Creating new GuildClient for %s', guild.name)

  /**
   * The Guild's ID.
   * @type {String}
   */
  this.id = guild.id

  /**
   * The bound TextChannel.
   * @type {import('discord.js').TextChannel?}
   */
  this.boundTextChannel = null

  /**
   * The connected VoiceChannel.
   * @type {import('discord.js').VoiceChannel?}
   */
  this.voiceChannel = null

  /**
   * The current looping state.
   * @type {Number}
   */
  this.loopState = 0

  /**
   * The Map of all MemberClients associated with the Guild, mapped by ID.
   * @type {Map<String, import('./MemberClient')>}
   */
  this.memberClients = new Map()

  /**
   * The associated Guild.
   * @type {import('discord.js').Guild}
   */
  this.guild = guild

  /**
   * The timestamp of the last command execution.
   * @type {Number}
   */
  this.lastCalled = Date.now() - 2000

  /**
   * Whether the purge command is active in this Guild.
   * @type {Boolean}
   */
  this.purging = false

  /**
   * The active poll message.
   * @type {import('discord.js').Message}
   */
  this.activePoll = null

  /**
   * The ID of the timeout interval function.
   * @type {Number?}
   */
  this.timeoutId = null

  /**
   * The GuildSettings for this Guild.
   * @type {GuildSettings?}
   */
  this.settings = null

  /**
   * The logger used for logging.
   * @type {import('pino')}
   */
  this.logger = Common.logger.child({ guild: guild.id, name: guild.name })

  /**
   * The playback manager for this GuildClient.
   * @type {GuildPlayer}
   */
  this.guildPlayer = new GuildPlayer(this)

  /**
   * The active VoiceConnection to the VoiceChannel.
   * @type {import('discord.js').VoiceConnection}
   */
  Object.defineProperty(this, 'connection', {
    get: () => this.guildPlayer.connection
  })

  Object.defineProperty(this, 'playing', {
    get: () => this.guildPlayer.songQueuer.playing
  })

  this.logger.debug(this)
}

// Extend the EventEmitter
GuildClient.prototype = Object.create(EventEmitter.prototype)
GuildClient.prototype.constructor = GuildClient

/**
 * Initializes all database-related values and adds the GuildClient to the guildClients Map.
 */
GuildClient.prototype.init = async function () {
  this.logger.info('Initializing GuildClient')
  this.logger.debug('Loading settings')
  this.settings = await GuildSettings.load(this.id)
  this.logger.debug('Read settings as %o', this.settings)
  Common.botClient.guildClients.set(this.guild.id, this)
}

/**
 * Sends a message through a TextChannel.
 *
 * Also takes into consideration the GuildSettings.
 *
 * @param {import('discord.js').TextChannel} channel The TextChannel to send the message through.
 * @param {String[] | String | import('discord.js').MessageEmbed} msg The message to send.
 * @param {Object?} opts The options to send the message with.
 * @returns {Promise<import('discord.js').Message[] | import('discord.js').Message>} Returns a promise for the sent messages.
 */
GuildClient.prototype.sendMsg = async function (channel, msg, opts) {
  if (!channel) {
    this.logger.warn('Attempted to send %o, but no text channel found!', msg)
    return
  }
  if (!this.checkTextPermissions(channel)) return
  this.logger.debug('Attempting to send %o to %s', msg, channel.name)
  if (this.settings.mentions === false) msg = await Strings.replaceMentions(msg, this.guild.members)
  return channel.send(msg, opts)
}

/**
 * Starts the timeout for cleanup.
 */
GuildClient.prototype.startTimeout = function () {
  this.logger.info('Starting expiration timer')
  this.lastCalled = Date.now()
  if (this.timeoutId) Common.botClient.clearTimeout(this.timeoutId)
  this.timeoutId = Common.botClient.setTimeout(() => { this.cleanUp() }, Timeouts.GUILD_TIMEOUT + 500)
}

/**
 * Starts the timeout for leaving after being alone in a VoiceChannel.
 */
GuildClient.prototype.startAloneTimeout = function () {
  this.logger.info('Starting alone timer')
  Common.botClient.setTimeout(() => {
    // Check again that the channel exists and is empty before leaving
    if (this.voiceChannel?.members.size === 1) {
      this.logger.info('Leaving channel, only member remaining')
      this.sendMsg(
        `${Emojis.sad} **I'm leaving, I'm all by myself!**`
      )
      this.disconnect()
    }
  }, Timeouts.ALONE_TIMEOUT + 500)
}

/**
 * Deletes the GuildClient and disconnects from the VoiceChannel.
 *
 * If the GuildClient has an active voice connection, disconnect instead.
 */
GuildClient.prototype.cleanUp = function () {
  if (Date.now() - this.lastCalled >= Timeouts.GUILD_TIMEOUT) {
    this.logger.info('Attempting to cleanup')
    // If the guild is currently connected, is not playing music, and has an active TextChannel,
    // notify, mark the guildClient for deletion, and leave
    if (this.boundTextChannel && this.connection && !this.playing) {
      this.logger.debug('Leaving voice channel')
      this.sendMsg(
        `${Emojis.happy} **It seems nobody needs me right now, so I'll be headed out. Call me when you do!**`
      )
      this.disconnect()
    } else if (!this.activePoll) {
      this.logger.debug('Deleting guildClient')
      Common.botClient.guildClients.delete(this.guild.id)
    }
  }
}

/**
 * Checks the GuildClient has necessary permissions in the bound TextChannel.
 *
 * @param {import('discord.js').TextChannel?} channel The TextChannel to check.
 * @param {import('discord.js').TextChannel?} notificationChannel The TextChannel to notify of missing permissions. Defaults to previous parameter.
 * @returns {Boolean} Returns whether the bot has all required permissions.
 */
GuildClient.prototype.checkTextPermissions = function (channel = this.boundTextChannel, notificationChannel = channel) {
  // Check that Snowboy has all necessary permissions in text channel
  const missingPerms = Functions.checkTextPermissions(channel)
  if (missingPerms) {
    this.logger.debug('Missing permissions: %o', missingPerms)
    if (missingPerms.includes('SEND_MESSAGES')) return
    notificationChannel.send(
      [
        `${Emojis.error} ***Please ensure I have all the following permissions in your text channel! I won't completely work otherwise!***`,
        Strings.formatList(missingPerms)
      ]
    )

    return false
  }

  return true
}

/**
 * Checks the GuildClient has necessary permissions in the bound VoiceChannel.
 *
 * @param {import('discord.js').VoiceChannel?} channel The VoiceChannel to check.
 * @param {import('discord.js').TextChannel?} notificationChannel The TextChannel to notify of missing permissions. Defaults to boundTextChannel.
 * @returns {Boolean} Returns whether any permissions are missing.
 */
GuildClient.prototype.checkVoicePermissions = function (channel = this.voiceChannel, notificationChannel = this.boundTextChannel) {
  // Check that Snowboy has all necessary permissions in text channel and voice channel
  const missingPerms = Functions.checkVoicePermissions(channel)
  if (missingPerms) {
    this.logger.debug('Missing permissions: %o', missingPerms)
    notificationChannel.send(
      [
        `${Emojis.error} ***Please ensure I have all the following permissions in your voice channel! I won't completely work otherwise!***`,
        Strings.formatList(missingPerms)
      ]
    )

    return false
  }

  return true
}

/**
 * Joins a voice channel.
 *
 * @param {import('discord.js').VoiceChannel} voiceChannel The VoiceChannel to join.
 * @fires GuildClient#connected
 * @returns {import('discord.js').VoiceConnection} Returns the created VoiceConnection, if any.
 */
GuildClient.prototype.connect = async function (voiceChannel) {
  if (!this.checkVoicePermissions(voiceChannel)) return
  this.voiceChannel = voiceChannel
  try {
    const connection = await voiceChannel.join()
    this.logger.info('Successfully connected!')
    this.logger.trace('Emitting connected event')
    connection.once('disconnect', this.disconnect.bind(this))
    /**
     * Connected event.
     *
     * @event GuildClient#connected
     * @type {Object}
     * @property {import('discord.js').VoiceConnection} connection The created VoiceConnection.
     */
    this.emit('connected', {
      connection: connection
    })
    return connection
  } catch (error) {
    this.sendMsg(
      `${Emojis.error} ***Could not connect! \\;(***`
    ).then(() => { throw error })
  }
}

/**
 * Leaves a guildClient's voice channel.
 *
 * @fires GuildClient#disconnected
 */
GuildClient.prototype.disconnect = function () {
  if (!this.voiceChannel) return
  this.logger.info('Disconnecting')
  const tempChannel = this.voiceChannel
  this.voiceChannel = null
  this.logger.trace('Stopping SnowClients')
  this.memberClients.forEach(member => { member.stopListening(); member.startTimeout() })
  this.logger.trace('Leaving voice channel')
  tempChannel.leave()
  this.logger.debug('Successfully left')
  this.boundTextChannel = null
  this.loopState = 0
  this.startTimeout()
  this.logger.trace('Emitting disconnected event')
  /**
   * Disconnected event.
   *
   * @event GuildClient#disconnected
   * @type {Object}
   * @property {import('discord.js').VoiceChannel} channel The disconnected VoiceChannel.
   */
  this.emit('disconnected', {
    channel: tempChannel
  })
}

module.exports = GuildClient
