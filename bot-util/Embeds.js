const Entities = require('html-entities').Html5Entities
const Discord = require('discord.js')
const GuildSettings = require('../guildSettings')
const UserSettings = require('../userSettings')
const { Emojis } = require('../config')

/**
 * Creates an embed for a video.
 *
 * @param {Object} vid The videoConstruct object representing the video.
 * @param {String} username The username of the video requester.
 * @returns {Discord.MessageEmbed} Returns a message embed detailing the video.
 */
function createVideoEmbed (vid, username) {
  return new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle(Entities.decode(vid.title))
    .setAuthor(Entities.decode(vid.channel))
    .addField('Queue position', vid.position, true)
    .addField('Length', vid.duration, true)
    .setThumbnail(vid.thumbnail)
    .setFooter(`Requested by ${username}`)
    .setURL(vid.url)
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
 * Creates an embed detailing the bot.
 *
 * @param {Discord.Client} botClient The Client of the bot.
 * @returns {Discord.MessageEmbed} Returns a message embed detailing the bot.
 */
function createAboutEmbed (botClient) {
  return new Discord.MessageEmbed()
    .setColor('#fffafa')
    .setTitle('__**About The Bot**__')
    .addField('Description', 'Snowboy is a voice-recognition bot built primarily to play music. ' +
    'It can also be considered an Alexa of sorts, as it has a variety of other functions for users (you!) to play around with.')
    .addField('Contact', 'To report bugs or any other inquiries, please go ahead and just direct message Snowboy about it. ' +
    'Please keep in mind that DMs should be kept to one message, or Snowboy may not log it in its entirety. ' +
    '**There is currently no support server for Snowboy. This will be updated if one is created.**')
    .addField('For Developers', 'Snowboy was built using NodeJS/Javascript. ' +
    'The different libraries and APIs used for Snowboy include Discord.js, __Wit.ai__, __Snowboy__, Keyv and a few Google Cloud APIs. ' +
    'I\'d highly recommend you to check out the underlined ones, they\'re both excellent, open-source ways to use speech recognition.')
    .setImage(botClient.user.displayAvatarURL({ size: 2048, format: 'png' }))
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
    .setTitle(`${Emojis.settings} __**Settings**__`)
    .setDescription('Use `settings <optionname>` to see more information about each option.')
    .addField('Server Settings', 'These settings apply on the server level.')
  GuildSettings.names.forEach(val => embed.addField(val[0], `\`${guildSettings[val[1]]}\``, true))
  embed.addField('User Settings', 'These settings apply on the user level.')
  UserSettings.names.forEach(val => embed.addField(val[0], `\`${userSettings[val[1]]}\``, true))
  return embed
}

module.exports = {
  createVideoEmbed: createVideoEmbed,
  createSearchEmbed: createSearchEmbed,
  createImageEmbed: createImageEmbed,
  createAboutEmbed: createAboutEmbed,
  createSettingsEmbed: createSettingsEmbed
}
