const { Emojis, Timeouts } = require('../../config')

/**
 * Creates a poll in chat.
 *
 * @param {import('../../structures/CommandContext')} context The command context.
 */
async function poll (context) {
  const logger = context.logger
  logger.info('Received poll command')
  let channel = context.channel
  const mentionedChannel = context.msg.mentions.channels.first()
  if (mentionedChannel && mentionedChannel.toString() === context.args[0]) {
    channel = mentionedChannel
    context.args.shift()
  }
  let duration = Timeouts.POLL_TIME
  if (!isNaN(context.args[0])) duration = Math.min(Math.floor(context.args.shift() * 1000), Timeouts.MAX_POLL_TIME)
  if (!context.args[0]) {
    context.sendMsg(
      `${Emojis.error} ***No prompt provided!***`
    )
    return
  }
  const pollPrompt = context.args.join(' ')
  const message = await context.guildClient.sendMsg(
    channel,
    `**POLL:** *${pollPrompt}*`
  )
  context.guildClient.activePoll = message
  message.awaitReactions(reaction => reaction.emoji.name === Emojis.y || reaction.emoji.name === Emojis.n, { time: duration }).then(reactions => {
    const ySize = reactions.get(Emojis.y)?.count - 1
    const nSize = reactions.get(Emojis.n)?.count - 1
    context.sendMsg(
      `> ${pollPrompt}\n **Results** \n *Yes:* \`${ySize}\` \n *No:* \`${nSize}\``
    )
    if (context.guildClient.activePoll === message) context.guildClient.activePoll = null
  })
  message.react(Emojis.y)
  message.react(Emojis.n)
}

module.exports = {
  name: 'poll',
  form: 'poll <channel to poll, or none> <duration in seconds, or none> <prompt>',
  description: 'Creates a yes/no poll.',
  usages: ['TEXT', 'GUILD_ONLY'],
  execute: poll
}
