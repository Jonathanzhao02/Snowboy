const GuildSettings = require('../GuildSettings')
const Common = require('../bot-util/Common')
const Discord = require('discord.js')

/**
 * Wrapper object for a Guild so that the bot can easily access all necessary resources.
 *
 * @property {String} id The Guild's ID.
 * @property {Discord.TextChannel} textChannel The bound TextChannel.
 * @property {Discord.VoiceChannel} voiceChannel The connected VoiceChannel.
 * @property {Discord.VoiceConnection} connection The active connection to the VoiceChannel.
 * @property {Object[]} songQueue The array of videos in the song queue.
 * @property {Number} loopState The current loop state of the GuildClient.
 * @property {Map} memberClients The Map of all MemberClients in the Guild.
 * @property {Boolean} playing Whether a song is playing or not.
 * @property {Boolean} downloading Whether a song is being downloaded or not.
 * @property {Discord.Guild} guild The Guild this GuildClient is tracking.
 * @property {Number} lastCalled The last time a command was called.
 * @property {Boolean} delete Whether the GuildClient is marked for deletion upon disconnect.
 * @property {Boolean} purging Whether the GuildClient is currently purging.
 * @property {Number} timeoutId The ID of the current timeout interval function.
 * @property {Object} logger The logger to use for this GuildClient.
 * @property {GuildSettings} settings The settings of the GuildClient.
 */
class GuildClient {
  /**
   * Creates a GuildClient object.
   *
   * @param {Discord.Guild} guild The Guild this GuildClient is tracking.
   */
  constructor (guild) {
    Common.logger.info('Creating new GuildClient for %s', guild.name)

    this.id = guild.id
    this.textChannel = null
    this.voiceChannel = null
    this.connection = null
    this.songQueue = []
    this.loopState = 0
    this.memberClients = new Map()
    this.playing = false
    this.downloading = false
    this.guild = guild
    this.lastCalled = Date.now() - 2000
    this.delete = false
    this.purging = false
    this.timeoutId = null
    this.settings = null
    this.logger = Common.logger.child({ guild: guild.id, name: guild.name })

    this.logger.debug(this)
  }

  /**
   * Initializes all database-related values and adds the GuildClient to the guildClients Map.
   */
  async init () {
    this.logger.info('Initializing GuildClient')
    this.logger.debug('Loading settings')
    this.settings = await GuildSettings.load(Common.gKeyv, this.id)
    this.logger.debug('Read settings as %o', this.settings)
    Common.botClient.guildClients.set(this.guild.id, this)
  }
}

module.exports = GuildClient
