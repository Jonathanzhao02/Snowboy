const Entities = require('html-entities').Html5Entities
const Discord = require('discord.js')
const GuildSettings = require('../structures/GuildSettings')
const UserSettings = require('../structures/UserSettings')
const { Emojis } = require('../config')
const Strings = require('./Strings')

/**
 * Creates an embed for a video.
 *
 * @param {Object} vid The videoConstruct object representing the video.
 * @returns {Discord.MessageEmbed} Returns a message embed detailing the video.
 */
function createVideoEmbed (vid, username) {
  return new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle(Entities.decode(vid.title))
    .setAuthor(Entities.decode(vid.channel))
    .addField('Queue position', vid.position === 0 ? 'Now!' : vid.position, true)
    .addField('Length', vid.duration, true)
    .setThumbnail(vid.thumbnail)
    .setFooter(`Requested by ${vid.requester}`)
    .setURL(vid.url)
}

/**
 * Creates an embed for a queue.
 *
 * @param {Array} queue The array of all videos.
 * @returns {Discord.MessageEmbed} Returns a message embed detailing the queue.
 */
function createQueueEmbed (queue) {
  const embed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle(`${Emojis.playing} **Up Next!**`)
  if (queue.length <= 1) {
    embed.setDescription('***ABSOLUTELY NOTHING***')
  } else {
    queue.forEach((vid, index) => {
      if (index === 0) return
      embed.addField(`\`${index}. ${Entities.decode(vid.title)}\``, '\u200b')
    })
  }

  return embed
}

/**
 * Creates an embed for a search result.
 *
 * @param {Object} result The JSON object representing the search result, returned by Custom Search API.
 * @param {String} username The username of the search requester.
 * @returns {Discord.MessageEmbed} Returns a message embed detailing the search result.
 */
function createSearchEmbed (result, username) {
  return new Discord.MessageEmbed()
    .setColor('#32cd32')
    .setTitle(Entities.decode(result.title))
    .setDescription(Entities.decode(result.snippet.replace(/\n/gi, '')))
    .setURL(result.link)
    .setImage(result.pagemap.cse_image[0].src)
    .setFooter(`Requested by ${username}`)
}

/**
 * Creates an embed for an image result.
 *
 * @param {Object} result The JSON object representing the image result, returned by g-i-s.
 * @param {String} username The username of the image requester.
 * @returns {Discord.MessageEmbed} Returns a message embed detailing the image result.
 */
function createImageEmbed (result, username) {
  return new Discord.MessageEmbed()
    .setColor('#32cd32')
    .setTitle(Entities.decode(result.query))
    .setURL(result.url)
    .setImage(result.url)
    .setFooter(`Requested by ${username}`)
}

/**
 * Creates an embed for a pokemon.
 *
 * @param {Object} pokemon The object containing all pokemon information.
 * @returns {Discord.MessageEmbed} Returns a message embed detailing the pokemon.
 */
function createPokemonEmbed (pokemon) {
  const embed = new Discord.MessageEmbed()
    .setColor('#ffff00')
    .setTitle(Strings.capitalize(pokemon.name))
    .setThumbnail(pokemon.sprites.front_default)
    .setURL(`https://bulbapedia.bulbagarden.net/wiki/${pokemon.name}_(Pok%C3%A9mon)`)
    .addField('**Types**', Strings.capitalize(pokemon.types.join(', ')))
    .addField('**Evolves From**', Strings.capitalize(pokemon.evolves_from || 'none'), true)
    .addField('**Evolves To**', Strings.capitalize(pokemon.evolves_to.join(', ') || 'none'), true)
    .addField('**Abilities**', Strings.capitalize(pokemon.abilities.join(', ')))
  pokemon.stats.forEach(val => {
    embed.addField(`**${Strings.capitalize(val.name)}:**`, `Base: ${val.base} EV: ${val.ev}`)
  })
  return embed
}

/**
 * Creates an embed detailing the bot.
 *
 * @param {Discord.Client} bot The bot's client.
 * @returns {Discord.MessageEmbed} Returns a message embed detailing the bot.
 */
function createAboutEmbed (bot) {
  return new Discord.MessageEmbed()
    .setColor('#fffafa')
    .setTitle('__**About The Bot**__')
    .addField('Description', 'Snowboy is a voice-recognition bot built primarily to play music. ' +
    'It can also be considered an Alexa of sorts, as it has a variety of other functions for users (you!) to play around with.')
    .addField('Contact', 'To report bugs or anything else you\'d like me to know, please go ahead and use the `report` command. ' +
    'Please keep in mind that reports should be kept to one message, or Snowboy will not log it in its entirety. ' +
    '**There is currently no support server for Snowboy. This will be updated if one is created.**')
    .addField('For Developers', 'Snowboy was built using NodeJS/Javascript. ' +
    'The different libraries and APIs used for Snowboy include Discord.js, __Wit.ai__, __Snowboy__, Keyv and a few Google Cloud APIs. ' +
    'I\'d highly recommend you to check out the underlined ones; they\'re both excellent, open-source ways to use speech recognition.')
    .setImage(bot.user.displayAvatarURL({ size: 2048, format: 'png' }))
}

/**
 * Creates an embed detailing the settings.
 *
 * @param {GuildSettings} guildSettings The GuildSettings object to be used in displaying values.
 * @param {UserSettings} userSettings The UserSettings object to be used in displaying values.
 * @returns {Discord.MessageEmbed} Returns a message embed detailing the GuildSettings values and properties.
 */
function createSettingsEmbed (guildSettings, userSettings) {
  const embed = new Discord.MessageEmbed()
    .setColor('#fffafa')
    .setTitle(`${Emojis.settings} __**Settings**__`)
    .setDescription('Use `settings <optionname>` to see more information about each option.')
    .addField('Server Settings', 'These settings apply on the server level.')
  GuildSettings.names.forEach(val => embed.addField(val[0], `\`${guildSettings[val[1]]}\``, true))
  embed.addField('User Settings', 'These settings apply on the user level.')
  UserSettings.names.forEach(val => embed.addField(val[0], `\`${userSettings[val[1]]}\``, true))
  return embed
}

/**
 * Creates an embed about either every command, or only a specific command.
 *
 * @param {Map<String, Object>} commands The map of all commands.
 * @param {String?} command The name of the command to display information about.
 * @returns {Discord.MessageEmbed} Returns a message embed detailing commands.
 */
function createHelpEmbed (commands, command) {
  if (command) {
    return new Discord.MessageEmbed()
      .setColor('#fffafa')
      .setTitle(`**${command}**`)
      .addField('Usage', `\`${commands.get(command).form}\``)
      .addField('Description', commands.get(command).description)
  }
  const embed = new Discord.MessageEmbed()
    .setColor('#fffafa')
    .setTitle(`${Emojis.settings} **Commands**`)
    .setDescription('Use `help <command name>` to get more information about each command!')
  commands.forEach((val, index) => {
    if (val.form && val.description) embed.addField(`\`${index}\``, '\u200b', true)
  })
  return embed
}

/**
 * Creates an embed detailing the bot's stats.
 *
 * @param {Discord.Client} bot The bot's client.
 * @returns {Discord.MessageEmbed} Returns a message embed detailing the bot's stats.
 */
function createStatsEmbed (bot) {
  const servers = bot.guilds.cache.size

  const secs = Math.floor(bot.uptime / 1000) % 60
  const mins = Math.floor(bot.uptime / 60000) % 60
  const hrs = Math.floor(bot.uptime / 3600000)

  return new Discord.MessageEmbed()
    .setColor('#fffafa')
    .setDescription(
      `${Emojis.stats} **I am currently in \`${servers}\` servers!**` + '\n' +
      `${Emojis.clock} **I've been up for \`${hrs}\` hrs, \`${mins}\` min, \`${secs}\` sec!**`)
}

/**
 * Creates an embed detailing the bot's invite link.
 *
 * @param {String} link The invite link.
 * @param {Discord.Client} bot The bot's client.
 * @returns {Discord.MessageEmbed} Returns a message embed detailing the bot's invite link.
 */
function createInviteEmbed (link, bot) {
  return new Discord.MessageEmbed()
    .setColor('#32cd32')
    .setTitle(`${Emojis.invite} Invite me here!`)
    .setAuthor('Snowboy', bot.user.displayAvatarURL({ size: 512, format: 'png' }), link)
    .setURL(link)
}

module.exports = {
  createVideoEmbed: createVideoEmbed,
  createQueueEmbed: createQueueEmbed,
  createSearchEmbed: createSearchEmbed,
  createImageEmbed: createImageEmbed,
  createPokemonEmbed: createPokemonEmbed,
  createAboutEmbed: createAboutEmbed,
  createSettingsEmbed: createSettingsEmbed,
  createHelpEmbed: createHelpEmbed,
  createStatsEmbed: createStatsEmbed,
  createInviteEmbed: createInviteEmbed
}
