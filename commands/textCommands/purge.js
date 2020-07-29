const Common = require('../../common')
const Emojis = require('../../emojis')
const { Functions } = require('../../bot-util')

const Discord = require('discord.js')

/**
 * Bulk deletes messages in a TextChannel with a variety of options.
 *
 * Due to API limitations, the bot can only delete up to
 * 100 messages between recursions, otherwise it will return.
 * Moreover, it can only delete messages up to 2 weeks old.
 *
 * @param {Object} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Any options sent with the command.
 * @param {Discord.Message} msg The Message the user sent.
 * @param {Number?} total The total number of messages deleted. Passed recursively.
 * @param {String?} snowflake The ID of the latest deleted message. Passed recursively.
 */
function purge (memberClient, args, msg, total, snowflake) {
  const logger = memberClient.logger
  const guildClient = memberClient.guildClient
  // On the first recursion, return if the purging command is already active
  if (guildClient.purging && !total) {
    logger.debug('Received command, but already purging')
    return
  }
  if (!total) {
    logger.info('Received purge command')

    // Check that the user can manage messages
    if (!msg.member.hasPermission(Discord.Permissions.FLAGS.MANAGE_MESSAGES, { checkAdmin: true, checkOwner: true })) {
      logger.debug('Rejected user due to insufficient permissions: MANAGE_MESSAGES')
      Functions.sendMsg(
        guildClient.textChannel,
        `${Emojis.error} ***You do not have permission to use this command!***`
      )
      return
    }

    total = 0
  }
  let filter = m => m.author.id === Common.botClient.user.id
  let mmbr
  logger.debug('Received args: %o', args)

  if (args[0]) {
    switch (args[0]) {
      // Include commands in the deletion
      case 'true':
        filter = m => m.author.id === Common.botClient.user.id || m.content.startsWith(guildClient.settings.prefix)
        break
      // Delete all messages
      case 'all':
        // Check that the user is an administrator
        if (!msg.member.hasPermission(Discord.Permissions.FLAGS.ADMINISTRATOR, { checkAdmin: true, checkOwner: true })) {
          logger.debug('Rejected user due to insufficient permissions: ADMINISTRATOR')
          Functions.sendMsg(
            guildClient.textChannel,
            `${Emojis.error} ***You do not have permission to use this command!***`
          )
          return
        }
        filter = m => true
        break
      // Delete the requester's messages
      case 'me':
        mmbr = msg.member
        filter = m => m.author.id === msg.author.id
        break
      // Delete the messages of the mentioned user
      default:
        if (msg.mentions && msg.mentions.members) mmbr = msg.mentions.members.array()[0]
        if (!mmbr) {
          logger.debug(`Rejected user due to invalid user: ${args[0]}`)
          Functions.sendMsg(
            guildClient.textChannel,
            `${Emojis.error} ***Could not find user \`${args[0]}\`***`
          )
          return
        } else {
          filter = m => m.author.id === mmbr.id
        }
        break
    }
  }

  // Flag that the purge command is already active
  guildClient.purging = true

  // Fetch 100 messages before the snowflake
  guildClient.textChannel.messages.fetch({ limit: 100, before: snowflake }).then(messages => {
    logger.trace('Fetched messages')
    // Bulk delete all fetched messages that pass through the filter
    guildClient.textChannel.bulkDelete(messages.filter(filter)).then(deletedMessages => {
      logger.trace('Deleting fetched messages')
      total += deletedMessages.size

      // If deleted messages, continue deleting recursively
      if (deletedMessages.size > 0) {
        logger.debug(`Recursively purging: ${total} messages deleted`)
        purge(memberClient, args, msg, total, deletedMessages.last().id)
      // If no messages deleted, purge command has finished all it can, return
      } else {
        logger.debug(`Finished purging: ${total} messages deleted`)
        guildClient.purging = false
        Functions.sendMsg(
          guildClient.textChannel,
          [
            `${Emojis.checkmark} **Successfully finished purging, <@${memberClient.id}>!**`,
            `${Emojis.trash} **Deleted \`${total}\` messages ${mmbr ? `from user \`${mmbr.displayName}\`` : ''}!**`
          ],
          guildClient.settings.mentions
        )
      }
    })
  })
}

module.exports = {
  name: 'purge',
  execute: purge
}
