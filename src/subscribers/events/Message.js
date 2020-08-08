const Common = require('../../bot-util/Common')
const Guilds = require('../../bot-util/Guilds')
const Commands = require('../../commands')
const Emojis = require('../../config').Emojis
const DEBUG_IDS = require('../../config').DEBUG_IDS
const Fs = require('fs')

module.exports = function (client) {
  /**
   * Logs a bug report from Snowboy's personal DMs.
   *
   * @param {import('discord.js').Message} msg The sent message.
   * @param {import('../../structures/UserClient')} userClient The userClient associated with the User who sent the message.
   */
  function logBug (msg, userClient) {
    const logger = userClient.logger
    logger.info('Received message in DM: %o', msg)
    if (Date.now() - userClient.lastReport < 86400000) {
      logger.info('Rejected bug report from %s', msg.author.username)
      msg.channel.send('**Please only send a bug report every 24 hours!**')
    } else {
      logger.info('Accepting bug report from %s', msg.author.username)
      userClient.lastReport = Date.now()
      logger.info('Read bug report from %s', msg.author.username)
      const file = Fs.createWriteStream(Common.defaultLogdir + `/${msg.createdAt.toISOString()}_${msg.createdAt.getTime()}_REPORT.txt`)
      file.write(msg.content)
      file.write('\n')
      file.write(`${msg.author.username}#${msg.author.discriminator}`)
      file.close()
      msg.channel.send('***Logged.*** Thank you for your submission!')
    }
  }

  /**
   * Parses the user's text commands.
   *
   * Handles bug reports, guildClient and member
   * creation, and the expiration timer.
   *
   * @param {import('discord.js').Message} msg The sent message.
   */
  async function onMessage (msg) {
    // If it is an automated message of some sort, return
    if (msg.author.bot || msg.system) return
    const { userClient, guildClient, memberClient } = await Guilds.createClientsFromMember(msg.member ? msg.member : msg.author)

    // If it is in Snowboy's DMs, log a new bug report and start the 24 hour cooldown.
    if (!guildClient) {
      logBug(msg, userClient)
      return
    }

    // If the message is not a command for Snowboy, return
    if (!msg.content.startsWith(guildClient.settings.prefix)) return

    // If there is no TextChannel associated with the guildClient, associate the current one
    if (!guildClient.textChannel || !guildClient.connection) guildClient.textChannel = msg.channel

    // Parse out command name and arguments
    const args = msg.content.slice(guildClient.settings.prefix.length).trim().split(/ +/)
    const commandName = args.shift().toLowerCase()

    guildClient.logger.info('Received %s', msg.content)
    guildClient.logger.debug('Understood command as %s and arguments as %o', commandName, args)

    // If the Guild is sending commands too fast, notify and return
    if (msg.createdAt.getTime() - guildClient.lastCalled < 1000) {
      guildClient.logger.info('Rejecting message, too fast')
      guildClient.sendMsg(
        `${Emojis.error} ***Please only send one command a second!***`
      )
      return
    }

    // If Snowboy is currently connected in the guild, and the GuildMember tries to run a restricted command (affects Snowboy's behavior
    // in the voice channel) in another text channel, notify the GuildMember and return
    if (guildClient.connection && msg.channel.id !== guildClient.textChannel.id && Commands.restricted.get(commandName)) {
      msg.channel.send(`${Emojis.error} ***Sorry, I am not actively listening to this channel!***`)
      return
    // If Snowboy is currently connected in the guild, and the GuildMember tries to run a restricted command without being in the active
    // voice channel, notify the GuildMember and return
    } else if (guildClient.connection && msg.member.voice.channelID !== guildClient.voiceChannel.id && Commands.restricted.get(commandName)) {
      guildClient.sendMsg(
        `${Emojis.error} ***Sorry, you are not in my voice channel!***`
      )
      return
    }

    // Check all relevant command maps for the current command name, and execute it
    if (Commands.bi.get(commandName)) {
      Commands.bi.get(commandName).execute(memberClient, args)
    } else if (Commands.restricted.get(commandName)) {
      Commands.restricted.get(commandName).execute(memberClient, args)
    } else if (Commands.text.get(commandName)) {
      Commands.text.get(commandName).execute(memberClient, args, msg)
    } else if (DEBUG_IDS.includes(memberClient.id) && Commands.debug.get(commandName)) {
      Commands.debug.get(commandName).execute(memberClient, args, msg)
    } else if (Commands.easteregg.get(commandName)) {
      Commands.easteregg.get(commandName).execute(memberClient, args)
    } else {
      guildClient.sendMsg(
        `${Emojis.confused} ***Sorry, I don't understand.***`
      )
    }

    guildClient.startTimeout()
  }

  client.on('message', onMessage)
}
