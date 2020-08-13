const GuildSettings = require('./GuildSettings')
const Common = require('../bot-util/Common')
const Functions = require('../bot-util/Functions')
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
  this.textChannel = null

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
   * @type {Map<String, MemberClient>}
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
   * Whether this GuildClient is marked for deletion upon disconnect.
   * @type {Boolean}
   */
  this.delete = false

  /**
   * Whether the purge command is active in this Guild.
   * @type {Boolean}
   */
  this.purging = false

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
 * Sends a message through this GuildClient's bound textChannel.
 *
 * Also takes into consideration the GuildSettings.
 *
 * @param {String[] | String | import('discord.js').MessageEmbed[] | import('discord.js').MessageEmbed} msg The message to send.
 * @param {Object?} opts The options to send the message with.
 * @property {import('discord.js').TextChannel} opts.textChannel The channel to send the message through.
 * @returns {Promise<import('discord.js').Message[] | import('discord.js').Message>} Returns a promise for the sent messages.
 */
GuildClient.prototype.sendMsg = async function (msg, opts) {
  const channel = Functions.extractProperty(opts || {}, 'textChannel') || this.textChannel
  if (!channel) {
    this.logger.warn('Attempted to send %o, but no text channel found!', msg)
    return
  }
  if (!this.checkTextPermissions(channel)) return
  this.logger.debug('Attempting to send %o to %s', msg, channel.name)
  if (this.settings.mentions === false) msg = await Functions.replaceMentions(msg, this.guild)
  if (opts && Functions.isEmpty(opts)) opts = null
  return channel.send(msg, opts)
}

/**
 * Starts the timeout for cleanup.
 */
GuildClient.prototype.startTimeout = function () {
  this.logger.info('Starting expiration timer')
  this.lastCalled = Date.now()
  if (this.timeoutId) Common.botClient.clearTimeout(this.timeoutId)
  this.timeoutId = Common.botClient.setTimeout(() => { this.cleanupGuildClient() }, Timeouts.TIMEOUT + 500)
}

/**
 * Deletes the GuildClient if it has been inactive for a certain amount of time.
 *
 * If the GuildClient has an active voice connection, notify through the TextChannel and mark the GuildClient
 * for deletion to be handled by the voiceStateUpdate event before leaving the voice channel.
 */
GuildClient.prototype.cleanupGuildClient = function () {
  if (Date.now() - this.lastCalled >= Timeouts.GUILD_TIMEOUT) {
    this.logger.debug('Attempting to clean up guildClient')
    // If the guild is currently connected, is not playing music, and has an active TextChannel,
    // notify, mark the guildClient for deletion, and leave
    if (this.textChannel && this.connection && !this.playing) {
      this.logger.debug('Leaving voice channel')
      this.sendMsg(
        `${Emojis.happy} **It seems nobody needs me right now, so I'll be headed out. Call me when you do!**`
      )
      this.delete = true
      this.leaveVoiceChannel()
    } else {
      this.logger.debug('Deleting guildClient')
      Common.botClient.guildClients.delete(this.guild.id)
    }
  }
}

/**
 * Checks the GuildClient has necessary permissions in the bound TextChannel.
 *
 * @param {import('discord.js').TextChannel?} channel The TextChannel to check.
 * @returns {Boolean} Returns whether the bot has all required permissions.
 */
GuildClient.prototype.checkTextPermissions = function (channel = this.textChannel) {
  // Check that Snowboy has all necessary permissions in text channel
  const missingPerms = Functions.checkTextPermissions(channel)
  if (missingPerms) {
    this.logger.debug('Missing permissions: %o', missingPerms)
    if (missingPerms.includes('SEND_MESSAGES')) return
    this.textChannel.send(
      [
        `${Emojis.error} ***Please ensure I have all the following permissions in your text channel! I won't completely work otherwise!***`,
        Functions.formatList(missingPerms)
      ]
    )

    return false
  }

  return true
}

/**
 * Checks the GuildClient has necessary permissions in the bound VoiceChannel.
 *
 * @returns {Boolean} Returns whether any permissions are missing.
 */
GuildClient.prototype.checkVoicePermissions = function (channel = this.voiceChannel) {
  // Check that Snowboy has all necessary permissions in text channel and voice channel
  const missingPerms = Functions.checkVoicePermissions(channel)
  if (missingPerms) {
    this.logger.debug('Missing permissions: %o', missingPerms)
    this.sendMsg(
      [
        `${Emojis.error} ***Please ensure I have all the following permissions in your voice channel! I won't completely work otherwise!***`,
        Functions.formatList(missingPerms)
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
GuildClient.prototype.joinVoiceChannel = async function (voiceChannel) {
  this.voiceChannel = voiceChannel
  if (!this.checkVoicePermissions()) return
  try {
    const connection = await voiceChannel.join()
    this.logger.info('Successfully connected!')
    this.logger.trace('Emitting connected event')
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
 * @returns {Boolean} Whether the disconnect was successful or not.
 * @fires GuildClient#disconnected
 */
GuildClient.prototype.leaveVoiceChannel = function () {
  if (!this.connection) {
    this.logger.debug('Not connected')
    return false
  }

  this.logger.debug('Leaving')
  this.logger.trace('Emitting disconnected event')
  /**
   * Disconnected event.
   *
   * @event GuildClient#disconnected
   * @type {Object}
   * @property {import('discord.js').VoiceChannel} channel The disconnected VoiceChannel.
   */
  this.emit('disconnected', {
    channel: this.voiceChannel
  })
  this.logger.trace('Cleaning up members')
  this.memberClients.forEach(member => { if (member.snowClient) member.snowClient.stop() })
  this.memberClients.clear()
  this.logger.trace('Leaving channel')
  this.voiceChannel.leave()
  this.logger.debug('Successfully left')
  this.voiceChannel = null
  this.loopState = 0
  return true
}

module.exports = GuildClient
