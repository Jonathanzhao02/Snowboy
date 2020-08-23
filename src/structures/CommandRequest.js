const Commands = require('../commands')
const CommandContext = require('./CommandContext')
const USAGE_FLAGS = require('../bot-util/Usage').FLAGS
const { DEBUG_IDS } = require('../config')
const { Emojis } = require('../config')

/**
 * Creates a request to execute a command.
 *
 * @param {import('./MemberClient') | import('./UserClient')} client The calling client.
 * @param {String} command The command name.
 * @param {String[]} args The command arguments.
 * @param {import('discord.js').Message | import('discord.js').VoiceState} src The source of the command.
 */
function CommandRequest (client, command, args, src) {
  /**
   * The context for the command.
   * @type {CommandContext}
   */
  this.context = new CommandContext(client, command, args, src)

  /**
   * The command execution.
   * @type {Function?}
   */
  this.execute = this.validate()?.bind(this, this.context)
}

/**
 * Validates the command existence and usages.
 *
 * @returns {Function} Returns the command execution.
 */
CommandRequest.prototype.validate = function () {
  const command = Commands.all.get(this.context.command)

  if (!command) return _ => this.context.sendMsg(`${Emojis.error} ***Command not found: \`${this.context.command}\`***`)
  const usages = command.usages

  if (usages.has(USAGE_FLAGS.VOICE) && !usages.has(USAGE_FLAGS.TEXT)) {
    if (!this.context.voice) return _ => {}
  } else if (usages.has(USAGE_FLAGS.TEXT) && !usages.has(USAGE_FLAGS.VOICE)) {
    if (!this.context.msg) return _ => {}
  }

  if (usages.has(USAGE_FLAGS.DEBUG_ONLY)) {
    if (!DEBUG_IDS.includes(this.context.id)) return _ => {}
  }

  if (usages.has(USAGE_FLAGS.GUILD_ONLY)) {
    if (!this.context.type === 'GUILD') return _ => this.context.sendMsg(`${Emojis.error} ***This command can only be called in a guild!***`)
  }

  if (usages.has(USAGE_FLAGS.IN_VOICE)) {
    if (!this.context.guildClient.connection || !this.context.voice.channelID === this.context.guildClient.voiceChannel.id) return _ => this.context.sendMsg(`${Emojis.error} ***You are not in a voice channel with me!***`)
  }

  return command.execute
}

module.exports = CommandRequest
