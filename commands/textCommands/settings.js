const Common = require('../../common')
const Emojis = require('../../emojis')
const { Embeds, Functions } = require('../../bot-util')

const Settings = require('../../settings')
const Discord = require('discord.js')

/**
 * Prints or modifies the settings of a guildClient.
 *
 * Depending on the passed arguments, can either print information
 * about the settings, about a certain option, or modify an option.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {String} userId Unused parameter.
 * @param {String[]} args The arguments passed with the command.
 * @param {Discord.Message} msg Unused parameter.
 */
function settings (guildClient, userId, args, msg) {
  const logger = guildClient.logger.child({ user: userId })
  logger.info('Received settings command')
  logger.debug('Received args')
  logger.debug(args)
  // Check that the user is an administrator
  if (!msg.member.hasPermission(Discord.Permissions.FLAGS.ADMINISTRATOR, { checkAdmin: true, checkOwner: true })) {
    Functions.sendMsg(guildClient.textChannel, `${Emojis.error} ***You do not have permission to use this command!***`)
    return
  }
  // If no arguments, print the settings embed with all values
  if (args.length === 0) {
    logger.debug('Printing settings')
    Functions.sendMsg(guildClient.textChannel, Embeds.createSettingsEmbed(guildClient.settings), guildClient)
    return
  }
  const settingName = args.shift().toLowerCase()
  // If no option named what the user passed in, notify and return
  if (!Settings.descriptions[settingName]) {
    logger.debug(`No setting found for ${settingName}`)
    Functions.sendMsg(guildClient.textChannel, `${Emojis.error} ***Could not find option named \`${settingName}\`***`)
    return
  }
  // If only passed in an option name, return information about that option
  if (args.length === 0) {
    logger.debug(`Printing info about ${settingName}`)
    Functions.sendMsg(guildClient.textChannel, Settings.descriptions[settingName](guildClient.settings), guildClient)
    return
  }
  // Modify the value of an option
  const val = args.join()
  logger.debug(`Attempting to set ${settingName} to ${val}`)
  Functions.sendMsg(guildClient.textChannel, guildClient.settings.set(Common.keyv, settingName, val), guildClient)
}

module.exports = {
  name: 'settings',
  execute: settings
}
