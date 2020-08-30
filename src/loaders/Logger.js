const { Paths } = require('../config')
const Pino = require('pino')
const Fs = require('fs')

module.exports = function () {
  // Create logger
  const defaultLogpath = Paths.defaultLogdir + '/latest.log'

  if (!Fs.existsSync(Paths.defaultLogdir)) {
    Fs.mkdirSync(Paths.defaultLogdir)
  }

  // Delete existing log
  if (Fs.existsSync(defaultLogpath)) {
    Fs.unlinkSync(defaultLogpath)
  }

  const logger = Pino({
    nestedKey: 'objs',
    serializers: {
      err: Pino.stdSerializers.err
    }
  }, Pino.destination(defaultLogpath))

  // Determines log level
  if (process.argv.includes('trace')) {
    logger.level = 'trace'
  } else if (process.argv.includes('debug')) {
    logger.level = 'debug'
  } else if (process.argv.includes('info')) {
    logger.level = 'info'
  } else if (process.argv.includes('warn')) {
    logger.level = 'warn'
  } else if (process.argv.includes('error')) {
    logger.level = 'error'
  } else if (process.argv.includes('fatal')) {
    logger.level = 'fatal'
  } else if (process.argv.includes('silent')) {
    logger.level = 'silent'
  }

  return logger
}
