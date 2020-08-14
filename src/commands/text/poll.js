const { Emojis, Timeouts } = require('../../config')

/**
 * Creates a poll in chat.
 *
 * @param {import('../../structures/MemberClient')} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args The poll content.
 * @param {import('discord.js').Message} msg The sent message.
 */
async function poll (memberClient, args, msg) {
  const logger = memberClient.logger
  logger.info('Received poll command')
  let channel = memberClient.guildClient.boundTextChannel
  const mentionedChannel = msg.mentions.channels.first()
  if (mentionedChannel && mentionedChannel.toString() === args[0]) {
    channel = mentionedChannel
    args.shift()
  }
  let duration = Timeouts.POLL_TIME
  if (!isNaN(args[0])) duration = Math.min(Math.floor(args.shift() * 1000), Timeouts.MAX_POLL_TIME)
  if (!args[0]) {
    memberClient.guildClient.sendMsg(
      `${Emojis.error} ***No prompt provided!***`,
      msg.channel
    )
    return
  }
  const message = await memberClient.guildClient.sendMsg(
    `**POLL:** *${args.join(' ')}*`,
    channel
  )
  await message.react(Emojis.y)
  await message.react(Emojis.n)
  const reactions = await message.awaitReactions(reaction => reaction.emoji.name === Emojis.y || reaction.emoji.name === Emojis.n, { time: duration })
  const ySize = reactions.get(Emojis.y).count - 1
  const nSize = reactions.get(Emojis.n).count - 1
  memberClient.guildClient.sendMsg(
    `**Results** \n *Yes:* \`${ySize}\` \n *No:* \`${nSize}\``,
    msg.channel
  )
}

module.exports = {
  name: 'poll',
  form: 'poll <channel to poll, or none> <duration in seconds, or none> <prompt>',
  description: 'Creates a yes/no poll.',
  execute: poll
}
