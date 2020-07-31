const Pino = require('pino')
const Fs = require('fs')
const Discord = require('discord.js')
const Keyv = require('keyv')
const { Gsearch, Wit } = require('./web-apis')

// Set up environmental variables
const Env = require('dotenv').config()
if (Env.error) throw Env.error

// Set API keys
Gsearch.setKey(process.env.GOOGLE_API_TOKEN)
Wit.setKey(process.env.WIT_API_TOKEN)

// Create logger
const defaultLogpath = './logs/latest.log'

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

// Create Discord bot client
const botClient = new Discord.Client()
botClient.guildClients = new Map() // to keep track of individual active guilds
botClient.userClients = new Map() // to keep track of individual user bug reports

// Create database connections
const gKeyv = new Keyv(
  process.argv.includes('-t') || process.argv.includes('--testing') ? 'sqlite://db/testing.db' : 'sqlite://db/snowboy.db',
  { table: 'guilds' })
const uKeyv = new Keyv(
  process.argv.includes('-t') || process.argv.includes('--testing') ? 'sqlite://db/testing.db' : 'sqlite://db/snowboy.db',
  { table: 'users' })
gKeyv.on('error', error => { throw error })
uKeyv.on('error', error => { throw error })

module.exports = {
  botClient: botClient,
  logger: logger,
  uKeyv: uKeyv,
  gKeyv: gKeyv
}
