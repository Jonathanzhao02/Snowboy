const Discord = require('discord.js')
const client = new Discord.Client()

const logger = require('./loaders')(client)
require('./subscribers')(client, logger)

const Admin = require('./snowboy-web-admin')
Admin.start(client, logger)

// Switch between testing bot and (future) production bot
if (process.argv.includes('-t') || process.argv.includes('--test')) {
  client.login(process.env.TEST_BOT_TOKEN)
} else {
  client.login(process.env.SNOWBOY_BOT_TOKEN)
}

/**
 * TODO:
 * Allow user setting modification in DMs
 * Add argument checking outside of commands
 * Add command cooldowns
 * Remove Common completely
 */
