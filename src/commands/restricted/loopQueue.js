const { Emojis } = require('../../config')

/**
 * Loops or stops looping current song queue.
 *
 * @param {import('../../structures/MemberClient')} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Unused parameter.
 */
function loopQueue (memberClient, args) {
  const logger = memberClient.logger
  logger.info('Received loopqueue command')
  if (!memberClient.guildClient.playing) {
    logger.debug('Not playing anything')
    memberClient.guildClient.sendMsg(
      `${Emojis.error} ***Nothing currently playing!***`
    )
    return
  }
  if (memberClient.guildClient.loopState === 2) {
    logger.debug('Stopping queue loop')
    memberClient.guildClient.loopState = 0
  } else {
    logger.debug('Looping queue')
    memberClient.guildClient.loopState = 2
  }

  memberClient.guildClient.sendMsg(
    `${Emojis.loop} **${memberClient.guildClient.loopState === 0 ? 'No longer' : 'Now'} looping the song!**`
  )
}

module.exports = {
  name: 'loopqueue',
  form: 'loopqueue',
  description: 'Tells Snowboy to loop the current queue.',
  execute: loopQueue
}
