const Entities = require('html-entities').Html5Entities
const Discord = require('discord.js')
const Emojis = require('./emojis')
const Streams = require('./streams')
const Config = require('./config')
const GuildSettings = require('./guildSettings')
const UserSettings = require('./userSettings')
const Common = require('./common')

module.exports = {
  Embeds: require('./embeds'),
  Responses: require('./responses'),
  Functions: require('./functions'),
  Guilds: require('./guilds'),
  Impressions: require('./impressions')
}
