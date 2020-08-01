const Common = require('../../common')
const { Emojis } = require('../../config')
const { Embeds, Functions } = require('../../bot-util')

const GuildSettings = require('../../guildSettings')
const UserSettings = require('../../userSettings')
const Discord = require('discord.js')

/**
 * Prints or modifies the settings of a guildClient.
 *
 * Depending on the passed arguments, can either print information
 * about the settings, about a certain option, or modify an option.
 *
 * @param {Object} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args The arguments passed with the command.
 * @param {Discord.Message} msg Unused parameter.
 */
function settings (memberClient, args, msg) {
  const logger = memberClient.logger
  const guildClient = memberClient.guildClient
  logger.info('Received settings command')
  logger.debug('Received args')
  logger.debug(args)
  // If no arguments, print the settings embed with all values
  if (args.length === 0) {
    logger.debug('Printing settings')
    Functions.sendMsg(
      guildClient.textChannel,
      Embeds.createSettingsEmbed(guildClient.settings, memberClient.userClient.settings)
    )
    return
  }
  const settingName = args.shift().toLowerCase()
  // If no option named what the user passed in, notify and return
  if (!GuildSettings.descriptions[settingName] && !UserSettings.descriptions[settingName]) {
    logger.debug('No setting found for %s', settingName)
    Functions.sendMsg(
      guildClient.textChannel,
      `${Emojis.error} ***Could not find option named \`${settingName}\`***`
    )
    return
  }

  // Setting option is for guilds
  if (GuildSettings.descriptions[settingName]) {
    // If only passed in an option name, return information about that option
    if (args.length === 0) {
      logger.debug('Printing info about %s', settingName)
      Functions.sendMsg(
        guildClient.textChannel,
        GuildSettings.descriptions[settingName](guildClient.settings)
      )
      return
    }

    // Check that the user is an administrator
    if (!msg.member.hasPermission(Discord.Permissions.FLAGS.ADMINISTRATOR, { checkAdmin: true, checkOwner: true })) {
      Functions.sendMsg(
        guildClient.textChannel,
        `${Emojis.error} ***You do not have permission to use this command!***`
      )
      return
    }
    // Modify the value of an option
    const val = args.join()
    logger.debug('Attempting to set %s to %s', settingName, val)
    Functions.sendMsg(
      guildClient.textChannel,
      guildClient.settings.set(Common.gKeyv, settingName, val)
    )
  // Setting option is for users
  } else {
    if (args.length === 0) {
      logger.debug('Printing info about %s', settingName)
      Functions.sendMsg(
        guildClient.textChannel,
        GuildSettings.descriptions[settingName](guildClient.settings)
      )
      return
    }
    // Modify the value of an option
    const val = args.join()
    logger.debug('Attempting to set %s to %s', settingName, val)
    Functions.sendMsg(
      guildClient.textChannel,
      memberClient.userClient.settings.set(Common.uKeyv, settingName, val)
    )
  }
}

module.exports = {
  name: 'settings',
  execute: settings
}
