/**
 * Needs:
 * Logger (Pino)
 * Channel (msg.channel / guildClient.boundTextChannel)
 * Message (sent msg) < check for existence to check if text command
 * GuildClient (memberClient.guildClient) < check for existence to check if guild command
 * MemberClient (requester)
 * UserClient (requester / memberClient.userClient)
 * sendMsg() (guildClient.sendMsg / userClient.sendMsg)
 * VoiceState (member.voice) < check for existence to check if voice command
 * Command (sent command)
 * Args (sent args)
 */

/**
 * Provides necessary context for command execution.
 *
 * @param {import('./UserClient') | import('./MemberClient')} client The client the command originated from.
 * @param {String} command The command name.
 * @param {String[]} args The command arguments.
 * @param {import('discord.js').Message | import('discord.js').VoiceState} src The Object through which the command was received.
 */
function CommandContext (client, command, args, src) {
  if (src.constructor.name === 'Message') {
    /**
     * The sent Message.
     * @type {import('discord.js').Message?}
     */
    this.msg = src

    /**
     * The TextChannel to reply through.
     * @type {import('discord.js').TextChannel}
     */
    this.channel = src.channel

    /**
     * The time this command was sent.
     * @type {Number}
     */
    this.timestamp = src.createdTimestamp
  } else if (src.constructor.name === 'VoiceState') {
    /**
     * The VoiceState the command was read from.
     * @type {import('discord.js').VoiceState?}
     */
    this.voice = src
    this.channel = client.guildClient.boundTextChannel
    this.timestamp = Date.now()
  }

  /**
   * The originating client.
   * @type {import('./MemberClient') | import('./UserClient')}
   */
  this.client = client

  if (client.constructor.name === 'MemberClient') {
    /**
     * The calling memberClient.
     * @type {import('./MemberClient')?}
     */
    this.memberClient = client

    /**
     * The calling memberClient's guildClient.
     * @type {import('./GuildClient')?}
     */
    this.guildClient = client.guildClient

    /**
     * The calling userClient.
     * @type {import('./UserClient')?}
     */
    this.userClient = client.userClient

    /**
     * The method to send messages through.
     * @type {Function}
     * @param {String | String[] | import('discord.js').MessageEmbed} msg The message to send.
     * @param {Object?} opts The options to send the message with.
     */
    this.sendMsg = this.guildClient.sendMsg.bind(this.guildClient, this.channel)

    /**
     * The name of the requester.
     * @type {String}
     */
    this.name = client.member.displayName

    /**
     * The ID of the requester.
     * @type {String}
     */
    this.id = client.member.id

    /**
     * Whether the command is from a guild or a DM.
     * @type {'GUILD' | 'DM'}
     */
    this.type = 'GUILD'
  } else if (client.constructor.name === 'UserClient') {
    this.userClient = client
    this.sendMsg = client.sendMsg
    this.name = client.user.username
    this.id = client.user.id
    this.type = 'DM'
  } else {
    throw new Error('Invalid client data type: ' + client.constructor.name)
  }

  /**
   * The command name.
   * @type {String}
   */
  this.command = command

  /**
   * The command arguments.
   * @type {String[]}
   */
  this.args = args

  /**
   * The logger.
   * @type {import('pino')}
   */
  this.logger = client.logger
}

module.exports = CommandContext