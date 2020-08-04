const Pino = require('pino')
const Fs = require('fs')
const Path = require('path')

module.exports = function (Common) {
  // Create logger
  const defaultLogdir = Path.resolve(__dirname, '../logs')
  const defaultLogpath = Path.resolve(__dirname, '../logs/latest.log')

  if (!Fs.existsSync(defaultLogdir)) {
    Fs.mkdirSync(defaultLogdir)
  }

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

  Common.set('logger', logger)
}
