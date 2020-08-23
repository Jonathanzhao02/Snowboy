const { Emojis } = require('../../config')
const Discord = require('discord.js')

/**
 * Bulk deletes messages in a TextChannel with a variety of options.
 *
 * Due to API limitations, the bot can only delete up to
 * 100 messages between recursions, otherwise it will return.
 * Moreover, it can only delete messages up to 2 weeks old.
 *
 * @param {import('../../structures/CommandContext')} context The command context.
 * @param {Number?} total The total number of messages deleted. Passed recursively.
 * @param {String?} snowflake The ID of the latest deleted message. Passed recursively.
 */
function purge (context, total, snowflake) {
  const logger = context.logger
  const guildClient = context.guildClient
  // On the first recursion, return if the purging command is already active
  if (guildClient.purging && !total) {
    logger.debug('Received command, but already purging')
    return
  }
  if (!total) {
    logger.info('Received purge command')

    // Check that the user can manage messages
    if (!context.memberClient.member.hasPermission(Discord.Permissions.FLAGS.MANAGE_MESSAGES, { checkAdmin: true, checkOwner: true })) {
      logger.debug('Rejected user due to insufficient permissions: MANAGE_MESSAGES')
      context.sendMsg(
        `${Emojis.error} ***You do not have permission to use this command!***`
      )
      return
    }

    total = 0
  }
  let filter = m => m.author.id === context.bot.user.id && m.deletable && !m.deleted
  let mmbr
  logger.debug('Received args: %o', context.args)

  if (context.args[0]) {
    switch (context.args[0]) {
      // Include commands in the deletion
      case 'true':
        filter = m => (m.author.id === context.bot.user.id || m.content.startsWith(guildClient.settings.prefix)) && m.deletable && !m.deleted
        break
      // Delete all messages
      case 'all':
        // Check that the user is an administrator
        if (!context.memberClient.member.hasPermission(Discord.Permissions.FLAGS.ADMINISTRATOR, { checkAdmin: true, checkOwner: true })) {
          logger.debug('Rejected user due to insufficient permissions: ADMINISTRATOR')
          context.sendMsg(
            `${Emojis.error} ***You do not have permission to use this command!***`
          )
          return
        }
        filter = m => m.deletable && !m.deleted
        break
      // Delete the requester's messages
      case 'me':
        mmbr = context.memberClient.member
        filter = m => m.author.id === context.id && m.deletable && !m.deleted
        break
      // Delete the messages of the mentioned user
      default:
        if (context.msg.mentions && context.msg.mentions.members) mmbr = context.msg.mentions.members.first()
        if (!mmbr) {
          logger.debug('Rejected user due to invalid user: %s', context.args[0])
          context.sendMsg(
            `${Emojis.error} ***Could not find user \`${context.args[0]}\`***`
          )
          return
        } else {
          filter = m => m.author.id === mmbr.id && m.deletable && !m.deleted
        }
        break
    }
  }

  // Flag that the purge command is already active
  guildClient.purging = true

  // Fetch 100 messages before the snowflake
  context.channel.messages.fetch({ limit: 100, before: snowflake }).then(messages => {
    logger.trace('Fetched messages')
    // Bulk delete all fetched messages that pass through the filter
    context.channel.bulkDelete(messages.filter(filter), { filterOld: true }).then(deletedMessages => {
      logger.trace('Deleting fetched messages')
      total += deletedMessages.size

      // If deleted messages, continue deleting recursively
      if (deletedMessages.size > 0 && deletedMessages.last()) {
        logger.debug('Recursively purging: %d messages deleted', total)
        purge(context, total, deletedMessages.last().id)
      // If no messages deleted, purge command has finished all it can, return
      } else {
        logger.debug('Finished purging: %d messages deleted', total)
        guildClient.purging = false
        context.sendMsg(
          [
            `${Emojis.checkmark} **Successfully finished purging, <@${context.id}>!**`,
            `${Emojis.trash} **Deleted \`${total}\` messages ${mmbr ? `from user \`${mmbr.displayName}\`` : ''}!**`
          ]
        )
      }
    })
  })
}

module.exports = {
  name: 'purge',
  form: 'purge <*all*, *true*, *me*, a mentioned user, or no arguments>',
  description: 'Purges either every message within two weeks (all), every command and Snowboy response (true), every message sent by a user (me/mention), or every Snowboy response (none).',
  usages: ['TEXT', 'GUILD_ONLY'],
  execute: purge
}
