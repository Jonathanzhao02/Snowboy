const GuildSettings = require('./GuildSettings')
const Common = require('../bot-util/Common')
const Functions = require('../bot-util/Functions')
const { Timeouts, Emojis } = require('../config')

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
   * The active connection to the VoiceChannel.
   * @type {import('discord.js').VoiceConnection?}
   */
  this.connection = null

  /**
   * The array of videos in the song queue.
   * @type {Object[]}
   */
  this.songQueue = []

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
   * Whether a song is currently playing.
   * @type {Boolean}
   */
  this.playing = false

  /**
   * Whether a song is currently being downloaded.
   * @type {Boolean}
   */
  this.downloading = false

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
   * @type {Pino}
   */
  this.logger = Common.logger.child({ guild: guild.id, name: guild.name })

  this.logger.debug(this)
}

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
 * @param {Object} opts The options to send the message with.
 * @returns {Promise<import('discord.js').Message[] | import('discord.js').Message>} Returns a promise for the sent messages.
 */
GuildClient.prototype.sendMsg = async function (msg, opts) {
  if (!this.textChannel) {
    this.logger.warn('Attempted to send %o, but no text channel found!', msg)
    return
  }
  this.logger.debug('Attempting to send %o to %s', msg, this.textChannel.name)
  this.checkTextPermissions()
  if (this.settings.mentions === false) msg = await Functions.replaceMentions(msg, this.guild)
  return this.textChannel.send(msg, opts)
}

/**
 * Starts the timeout for cleanup.
 */
GuildClient.prototype.startTimeout = function () {
  this.logger.info('Starting expiration timer')
  this.lastCalled = Date.now()
  if (this.timeoutId) clearTimeout(this.timeoutId)
  this.timeoutId = setTimeout(() => { this.cleanupGuildClient() }, Timeouts.TIMEOUT + 500)
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
      this.voiceChannel.leave()
    } else {
      this.logger.debug('Deleting guildClient')
      Common.botClient.guildClients.delete(this.guild.id)
    }
  }
}

/**
 * Leaves a guildClient's voice channel.
 *
 * @returns {Boolean} Whether the disconnect was successful or not.
 */
GuildClient.prototype.leaveVoiceChannel = function () {
  if (!this.connection) {
    this.logger.debug('Not connected')
    return false
  }

  this.logger.debug('Leaving')
  this.logger.trace('Disconnecting')
  this.songQueue = []
  if (this.connection.dispatcher) {
    this.logger.trace('Ending dispatcher')
    this.connection.dispatcher.end()
  }
  this.logger.trace('Cleaning up members')
  this.memberClients.forEach(member => { if (member.snowClient) member.snowClient.stop() })
  this.memberClients.clear()
  this.logger.trace('Leaving channel')
  this.connection.disconnect()
  this.connection.removeAllListeners()
  this.voiceChannel.leave()
  this.voiceChannel = null
  this.textChannel = null
  this.connection = null
  this.loopState = 0
  this.logger.debug('Successfully left')
  return true
}

/**
 * Checks the GuildClient has necessary permissions in the bound TextChannel.
 *
 * @returns {Boolean} Returns whether any permissions are missing.
 */
GuildClient.prototype.checkTextPermissions = function () {
  // Check that Snowboy has all necessary permissions in text channel
  const missingPerms = Functions.checkTextPermissions(this.textChannel)
  if (missingPerms) {
    this.logger.debug('Missing permissions: %o', missingPerms)
    if (missingPerms.includes('SEND_MESSAGES')) return
    this.sendMsg(
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
GuildClient.prototype.checkVoicePermissions = function () {
  // Check that Snowboy has all necessary permissions in text channel and voice channel
  const missingPerms = Functions.checkVoicePermissions(this.voiceChannel)
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

GuildClient.prototype.joinVoiceChannel = function (voiceChannel) {
  this.voiceChannel = voiceChannel
  if (!this.checkVoicePermissions()) return
  voiceChannel.join().then(connection => {
    this.logger.info('Successfully connected!')
    this.connection = connection
    this.logger.info('Playing silence over connection')
    Functions.playSilence(connection)
  }).catch(e => {
    this.sendMsg(
      `${Emojis.error} ***Could not connect! \\;(***`
    ).then(() => { throw e })
  })
}

module.exports = GuildClient
