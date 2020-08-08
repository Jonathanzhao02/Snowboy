/**
 * Handles all playback-related operations for a GuildClient.
 *
 * @param {import('./GuildClient')} guildClient The GuildClient to handle.
 */
function GuildPlayer (guildClient) {
  this.guildClient = guildClient
  this.connection = null
  this.dispatcher = null

  guildClient.on('connected', connection => { this.connection = connection })
  guildClient.on('disconnected', connection => { this.connection = null })
}

module.exports = GuildPlayer
