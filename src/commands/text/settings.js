const Embeds = require('../../bot-util/Embeds')
const { Emojis } = require('../../config')

const GuildSettings = require('../../structures/GuildSettings')
const UserSettings = require('../../structures/UserSettings')
const Discord = require('discord.js')

/**
 * Prints or modifies the settings of a guildClient.
 *
 * Depending on the passed arguments, can either print information
 * about the settings, about a certain option, or modify an option.
 *
 * @param {import('../../structures/CommandContext')} context The command context.
 */
function settings (context) {
  const logger = context.logger
  const guildClient = context.guildClient
  logger.info('Received settings command')
  logger.debug('Received args')
  logger.debug(context.args)
  // If no arguments, print the settings embed with all values
  if (context.args.empty) {
    logger.debug('Printing settings')
    context.sendMsg(
      Embeds.createSettingsEmbed(guildClient.settings, context.userClient.settings)
    )
    return
  }
  const settingName = context.args.shift().toLowerCase()
  // If no option named what the user passed in, notify and return
  if (!GuildSettings.descriptions[settingName] && !UserSettings.descriptions[settingName]) {
    logger.debug('No setting found for %s', settingName)
    context.sendMsg(
      `${Emojis.error} ***Could not find option named \`${settingName}\`***`
    )
    return
  }

  // Setting option is for guilds
  if (GuildSettings.descriptions[settingName]) {
    // If only passed in an option name, return information about that option
    if (context.args.empty) {
      logger.debug('Printing info about %s', settingName)
      context.sendMsg(
        GuildSettings.descriptions[settingName](guildClient.settings)
      )
      return
    }

    // Check that the user is an administrator
    if (!context.memberClient.member.hasPermission(Discord.Permissions.FLAGS.ADMINISTRATOR, { checkAdmin: true, checkOwner: true })) {
      context.sendMsg(
        `${Emojis.error} ***You do not have permission to use this command!***`
      )
      return
    }
    // Modify the value of an option
    const val = context.args.join()
    logger.debug('Attempting to set %s to %s', settingName, val)
    context.sendMsg(
      guildClient.settings.set(settingName, val)
    )
  // Setting option is for users
  } else {
    if (context.args.empty) {
      logger.debug('Printing info about %s', settingName)
      context.sendMsg(
        UserSettings.descriptions[settingName](context.userClient.settings)
      )
      return
    }
    // Modify the value of an option
    const val = context.args.join()
    logger.debug('Attempting to set %s to %s', settingName, val)
    context.sendMsg(
      context.userClient.settings.set(settingName, val)
    )
  }
}

module.exports = {
  name: 'settings',
  form: 'settings <option name, or no arguments> <new value, or no arguments>',
  description: 'Lists every option (none), lists information about an option (option name), or sets the value of an option (option name, new value).',
  usages: ['TEXT', 'GUILD_ONLY'],
  execute: settings
}
