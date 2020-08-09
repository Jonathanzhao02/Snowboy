const Discord = require('discord.js')
const Admin = require('./snowboy-web-admin')
Admin.start()

const client = new Discord.Client()

require('./loaders')(client)
require('./subscribers')(client)

// Switch between testing bot and (future) production bot
if (process.argv.includes('-t') || process.argv.includes('--test')) {
  client.login(process.env.TEST_BOT_TOKEN)
} else {
  client.login(process.env.SNOWBOY_BOT_TOKEN)
}