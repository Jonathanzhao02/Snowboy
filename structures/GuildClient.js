const GuildSettings = require('./GuildSettings')
const Common = require('../bot-util/Common')

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
  this.settings = await GuildSettings.load(Common.gKeyv, this.id)
  this.logger.debug('Read settings as %o', this.settings)
  Common.botClient.guildClients.set(this.guild.id, this)
}

module.exports = GuildClient
