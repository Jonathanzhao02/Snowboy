const Common = require('../../bot-util/Common')
const Fs = require('fs')

/**
 * Logs a bug report.
 *
 * @param {import('../../structures/CommandContext')} context The command context.
 */
function bugReport (context) {
  const logger = context.logger
  logger.info('Received stats command')
  if (Date.now() - context.userClient.lastReport < 86400000) {
    logger.info('Rejected bug report')
    context.userClient.sendMsg('**Please only send a bug report every 24 hours!**')
  } else {
    logger.info('Accepting bug report')
    context.userClient.lastReport = Date.now()
    const file = Fs.createWriteStream(Common.defaultLogdir + `/${context.msg.createdAt.toISOString()}_${context.msg.createdTimestamp}_REPORT.txt`)
    file.write(context.args.join(' '))
    file.write('\n')
    file.write(`${context.msg.author.username}#${context.msg.author.discriminator}`)
    file.close()
    context.userClient.sendMsg('**Logged, thank you for your submission!**')
  }
}

module.exports = {
  name: 'bugreport',
  form: 'bugreport',
  description: 'Sends Snowboy a bug report. Please keep it to one message! Usable once every 24 hours.',
  usages: ['TEXT'],
  execute: bugReport
}
