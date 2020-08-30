const { Emojis, Timeouts } = require('../../config')

/**
 * Creates a poll in chat.
 *
 * @param {import('../../structures/CommandContext')} context The command context.
 */
async function poll (context) {
  const logger = context.logger
  logger.info('Received poll command')
  const channel = context.args.extractChannelMention(1) || context.channel
  const duration = Math.min(Math.floor(context.args.extractNumerical(1) * 1000), Timeouts.MAX_POLL_TIME) || Timeouts.POLL_TIME
  if (context.args.empty) {
    context.sendMsg(
      `${Emojis.error} ***No prompt provided!***`
    )
    return
  }
  const pollPrompt = context.args.join()
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
