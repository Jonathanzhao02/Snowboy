const Discord = require('discord.js')
const client = new Discord.Client()

require('./loaders')(client)
require('./subscribers')(client)

const Admin = require('./snowboy-web-admin')
Admin.start()

// Switch between testing bot and (future) production bot
if (process.argv.includes('-t') || process.argv.includes('--test')) {
  client.login(process.env.TEST_BOT_TOKEN)
} else {
  client.login(process.env.SNOWBOY_BOT_TOKEN)
}

/**
 * TODO:
 * Allow user setting modification in DMs
 * Add command cooldown to DMs
 * Add usage checking
 * Add mention checking to UserClient sendMsg
 * Add check voice connection to deafen/undeafen and similar commands (in voice, not necessarily with snowboy)
 * Add argument checking outside of commands
 * Add PLAYING flag to usages (check music is playing)
 */
