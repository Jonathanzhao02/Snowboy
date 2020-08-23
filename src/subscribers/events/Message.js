const Common = require('../../bot-util/Common')
const Clients = require('../../bot-util/Clients')
const Config = require('../../config')
const CommandRequest = require('../../structures/CommandRequest')
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
   * Handles commands in a Guild.
   *
   * @param {import('discord.js').Message} msg The sent message.
   * @param {import('../../structures/UserClient')} userClient The userClient associated with the User who sent the message.
   */
  function handleDMCommands (msg, userClient) {
    const prefix = Config.SettingsValues.DEFAULT_BOT_PREFIX
    // If the message is not a command for Snowboy, return
    if (!msg.content.startsWith(prefix)) return

    // Parse out command name and arguments
    const args = msg.content.slice(prefix.length).trim().split(/ +/)
    const commandName = args.shift().toLowerCase()

    userClient.logger.info('Received %s', msg.content)
    userClient.logger.debug('Understood command as %s and arguments as %o', commandName, args)

    // If the Guild is sending commands too fast, notify and return
    if (msg.createdTimestamp - userClient.lastCalled < 1000) {
      userClient.logger.info('Rejecting message, too fast')
      userClient.sendMsg(
        `${Config.Emojis.error} ***Please only send one command a second!***`
      )
      return
    }

    // Check all relevant command maps for the current command name, and execute it
    new CommandRequest(userClient, commandName, args, msg).execute()
  }

  /**
   * Handles commands in a Guild.
   *
   * @param {import('discord.js').Message} msg The sent message.
   * @param {import('../../structures/MemberClient')} memberClient The memberClient associated with the GuildMember who sent the message.
   * @param {import('../../structures/GuildClient')} guildClient The guildClient the command was issued to.
   */
  function handleGuildCommands (msg, memberClient, guildClient) {
    // If the message is not a command for Snowboy, return
    if (!msg.content.startsWith(guildClient.settings.prefix)) return

    // Parse out command name and arguments
    const args = msg.content.slice(guildClient.settings.prefix.length).trim().split(/ +/)
    const commandName = args.shift().toLowerCase()

    guildClient.logger.info('Received %s', msg.content)
    guildClient.logger.debug('Understood command as %s and arguments as %o', commandName, args)

    if (!guildClient.checkTextPermissions(msg.channel)) return

    // If the Guild is sending commands too fast, notify and return
    if (msg.createdTimestamp - guildClient.lastCalled < 1000) {
      guildClient.logger.info('Rejecting message, too fast')
      guildClient.sendMsg(
        msg.channel,
        `${Config.Emojis.error} ***Please only send one command a second!***`
      )
      return
    }

    // Check all relevant command maps for the current command name, and execute it
    new CommandRequest(memberClient, commandName, args, msg).execute()
    guildClient.startTimeout()
    memberClient.startTimeout()
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
    const { userClient, guildClient, memberClient } = await Clients.createClientsFromMember(msg.member || msg.author)

    if (msg.channel.type === 'dm') {
      handleDMCommands(msg, userClient)
    } else {
      handleGuildCommands(msg, memberClient, guildClient)
    }
  }

  client.on('message', onMessage)
}
