const Common = require('../../bot-util/Common')
const { Emojis } = require('../../config')

const Discord = require('discord.js')

/**
 * Bulk deletes messages in a TextChannel with a variety of options.
 *
 * Due to API limitations, the bot can only delete up to
 * 100 messages between recursions, otherwise it will return.
 * Moreover, it can only delete messages up to 2 weeks old.
 *
 * @param {import('../../structures/MemberClient')} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Any options sent with the command.
 * @param {import('discord.js').Message} msg The sent message.
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
      memberClient.guildClient.sendMsg(
        `${Emojis.error} ***You do not have permission to use this command!***`,
        msg.channel
      )
      return
    }

    total = 0
  }
  let filter = m => m.author.id === Common.botClient.user.id && m.deletable && !m.deleted
  let mmbr
  logger.debug('Received args: %o', args)

  if (args[0]) {
    switch (args[0]) {
      // Include commands in the deletion
      case 'true':
        filter = m => (m.author.id === Common.botClient.user.id || m.content.startsWith(guildClient.settings.prefix)) && m.deletable && !m.deleted
        break
      // Delete all messages
      case 'all':
        // Check that the user is an administrator
        if (!msg.member.hasPermission(Discord.Permissions.FLAGS.ADMINISTRATOR, { checkAdmin: true, checkOwner: true })) {
          logger.debug('Rejected user due to insufficient permissions: ADMINISTRATOR')
          memberClient.guildClient.sendMsg(
            `${Emojis.error} ***You do not have permission to use this command!***`,
            msg.channel
          )
          return
        }
        filter = m => m.deletable && !m.deleted
        break
      // Delete the requester's messages
      case 'me':
        mmbr = msg.member
        filter = m => m.author.id === msg.author.id && m.deletable && !m.deleted
        break
      // Delete the messages of the mentioned user
      default:
        if (msg.mentions && msg.mentions.members) mmbr = msg.mentions.members.first()
        if (!mmbr) {
          logger.debug('Rejected user due to invalid user: %s', args[0])
          memberClient.guildClient.sendMsg(
            `${Emojis.error} ***Could not find user \`${args[0]}\`***`,
            msg.channel
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
  msg.channel.messages.fetch({ limit: 100, before: snowflake }).then(messages => {
    logger.trace('Fetched messages')
    // Bulk delete all fetched messages that pass through the filter
    msg.channel.bulkDelete(messages.filter(filter), { filterOld: true }).then(deletedMessages => {
      logger.trace('Deleting fetched messages')
      total += deletedMessages.size

      // If deleted messages, continue deleting recursively
      if (deletedMessages.size > 0 && deletedMessages.last()) {
        logger.debug('Recursively purging: %d messages deleted', total)
        purge(memberClient, args, msg, total, deletedMessages.last().id)
      // If no messages deleted, purge command has finished all it can, return
      } else {
        logger.debug('Finished purging: %d messages deleted', total)
        guildClient.purging = false
        memberClient.guildClient.sendMsg(
          [
            `${Emojis.checkmark} **Successfully finished purging, <@${memberClient.id}>!**`,
            `${Emojis.trash} **Deleted \`${total}\` messages ${mmbr ? `from user \`${mmbr.displayName}\`` : ''}!**`
          ],
          msg.channel
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
