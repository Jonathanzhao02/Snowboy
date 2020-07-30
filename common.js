const Pino = require('pino')
const Fs = require('fs')
const Discord = require('discord.js')
const Keyv = require('keyv')
const Gsearch = require('./web_apis/gsearch')
const Wit = require('./web_apis/wit')

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
