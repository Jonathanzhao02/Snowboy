const { Emojis } = require('../../config')

/**
 * Loops or stops looping current song.
 *
 * @param {import('../../structures/MemberClient')} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Unused parameter.
 */
function loop (memberClient, args) {
  const logger = memberClient.logger
  logger.info('Received loop command')
  if (!memberClient.guildClient.playing) {
    logger.debug('Not playing anything')
    memberClient.guildClient.sendMsg(
      `${Emojis.error} ***Nothing currently playing!***`
    )
    return
  }

  if (memberClient.guildClient.loopState === 1) {
    logger.debug('Stopping song loop')
    memberClient.guildClient.loopState = 0
  } else {
    logger.debug('Looping song')
    memberClient.guildClient.loopState = 1
  }

  memberClient.guildClient.sendMsg(
    `${Emojis.loop} **${memberClient.guildClient.loopState === 0 ? 'No longer' : 'Now'} looping the song!**`
  )
}

module.exports = {
  name: 'loop',
  form: 'loop',
  description: 'Tells Snowboy to loop the current song.',
  execute: loop
}
