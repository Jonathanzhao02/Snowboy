const Entities = require('html-entities').Html5Entities
const Discord = require('discord.js')
const Emojis = require('./emojis')
const Streams = require('./streams')
const Config = require('./config')

/**
 * Creates an embed for a video.
 *
 * @param {Object} vid The JSON object representing the video, returned by Youtube Data API.
 * @param {String} username The username of the video requester.
 * @returns {Discord.MessageEmbed} Returns a message embed detailing the video.
 */
function createVideoEmbed (vid, username) {
  return new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle(Entities.decode(vid.snippet.title))
    .setAuthor(Entities.decode(vid.snippet.channelTitle))
    .setDescription(Entities.decode(vid.snippet.description))
    .setThumbnail(vid.snippet.thumbnails.high.url)
    .setFooter(`Requested by ${username}`)
    .setURL(`http://www.youtube.com/watch?v=${vid.id.videoId}`)
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
 * @param {Settings} settings The Settings object to be used in displaying values.
 * @returns {Discord.MessageEmbed} Returns a message embed detailing the Settings values and properties.
 */
function createSettingsEmbed (settings) {
  return new Discord.MessageEmbed()
    .setTitle(`${Emojis.settings} __**Settings**__`)
    .setDescription('Use `settings [option name]` to see more information about each option.')
    .addField('prefix', `\`${settings.prefix}\``)
    .addField('impressions', `\`${settings.impressions}\``)
    .addField('voice', `\`${settings.voice}\``)
    .addField('mentions', `\`${settings.mentions}\``)
    .addField('sensitivity', `\`${settings.sensitivity}\``)
}

/**
 * Generates a random integer between [0, bound - 1]
 *
 * @param {Number} bound The upper bound of the random number.
 * @returns {Number} Returns the random number.
 */
function random (bound) {
  var num = Math.floor(Math.random() * Math.floor(bound))
  return (num < bound) ? num : bound
}

// The list of greetings used for when the bot joins
const greetings = [
  'Hey there',
  'Hi',
  '\'Sup',
  'Hey',
  'Hello',
  'Que pasa',
  'Long time no see',
  'I\'ve missed you',
  'It\'s great to see ya',
  'It\'s good to see you',
  'Nice to see you',
  'Ahoy',
  'Howdy',
  'Good to see you',
  'Looking good',
  'Looking sharp as always',
  'Great seeing you'
]

// The list of farewells used for when the bot leaves
const farewells = [
  'Goodbye',
  'See ya',
  'Adios',
  'Bye bye',
  'Bye',
  'Later',
  'I\'ll miss ya',
  'See you later',
  'Take it easy',
  'Have a nice day',
  '\'Til next time',
  'Take care',
  'It was nice to see you',
  'Peace',
  'See you soon',
  'I\'ll always be here for you'
]

// The list of replies used for when a hotword is triggered, ordered by likability
const hotwordReplies = [
  ['What?'],
  ['Huh?', 'Hmm?'],
  ['What do you want, {0}?', 'Just tell me what you need, {0}.'],
  ['Yes, {0}?', 'How can I help you, {0}?', 'What do you need, {0}?', 'Anything you need, {0}?'],
  ['How can I help you, {0}?', 'What do you need, {0}?', 'Anything I can do for you, {0}?'],
  ['What\'s up, {0}?', 'Yeah, {0}?', 'What can I do for you, {0}?'],
  ['What\'s up, {0}?', 'Yeah, {0}?']
]

// The list of emojis used for when a hotword is triggered, ordered by likability
const hotwordEmojis = [
  ' ',
  ' ',
  Emojis.checkmark,
  Emojis.checkmark,
  Emojis.checkmark,
  Emojis.happy,
  Emojis.happy
]

// The list of replies used for when the bot is asked for its impression of somebody, ordered by likability
const impressionReplies = [
  ['Shut up.', 'I don\'t care.', 'Screw you.'],
  ['I don\'t like you, {0}.', 'You\'re a bit of a jerk, {0}.', 'My mother always told me if I don\'t have anything nice to say, don\'t say anything at all.'],
  ['I\'d appreciate it if you were kinder, {0}.', 'Just keep some distance, {0}.', 'I guess you\'re bearable, {0}.'],
  ['You\'re okay, {0}.', 'I guess you\'re alright, {0}.', 'Let\'s just keep this professional, huh?'],
  ['You\'re a pretty decent person, {0}.', 'I think you\'re pretty cool, {0}.', 'You\'re good in my book, {0}.'],
  ['I like you, {0}.', 'We\'re pretty tight, {0}.', 'We\'re pretty chill, {0}.'],
  ['Let\'s just say you could have intercourse with my romantic partner, {0}.', 'Man, I love you, {0}!', 'I wish I could hang out with you {0} but, you know, I\'m digital and all.']
]

// The list of emojis used for when the bot is asked for its impression of somebody, ordered by likability
const impressionEmojis = [
  Emojis.angry,
  Emojis.weird,
  Emojis.annoyed,
  Emojis.neutral,
  Emojis.content,
  Emojis.happy,
  Emojis.joyful
]

// The response strings
const replies = new Map()
replies.set('hotword', hotwordReplies)
replies.set('impression', impressionReplies)

// The response emojis
const replyEmojis = new Map()
replyEmojis.set('hotword', hotwordEmojis)
replyEmojis.set('impression', impressionEmojis)

// Enumeration representing each likability level
const Relation = {
  HATE: 0,
  DISLIKE: 1,
  SLIGHT_DISLIKE: 2,
  NEUTRAL: 3,
  SLIGHT_LIKE: 4,
  LIKE: 5,
  LOVE: 6
}

/**
 * Converts an impression level to a likability level.
 *
 * @param {Number} impression The impression level.
 * @returns {Number} Returns the index of the likability level.
 */
function convertToRelation (impression) {
  if (impression <= Config.ImpressionThresholds.HATE_THRESHOLD) return Relation.HATE
  if (impression <= Config.ImpressionThresholds.DISLIKE_THRESHOLD) return Relation.DISLIKE
  if (impression <= Config.ImpressionThresholds.SLIGHT_DISLIKE_THRESHOLD) return Relation.SLIGHT_DISLIKE
  if (impression <= Config.ImpressionThresholds.NEUTRAL_THRESHOLD) return Relation.NEUTRAL
  if (impression <= Config.ImpressionThresholds.SLIGHT_LIKE_THRESHOLD) return Relation.SLIGHT_LIKE
  if (impression <= Config.ImpressionThresholds.LIKE_THRESHOLD) return Relation.LIKE
  if (impression <= Config.ImpressionThresholds.LOVE_THRESHOLD) return Relation.LOVE
}

/**
 * Replaces each {#} in a string with each argument supplied, in order.
 *
 * Copies functionality of Java's String.format() method.
 *
 * @param {String} msg The string to format.
 * @param {String[]} args The arguments to replace each index with.
 * @returns {String} Returns the formatted string.
 */
function format (msg, args) {
  for (var i = 0; i < args.length; i++) {
    const regex = new RegExp(`\\{${i}\\}`, 'gi')
    msg = msg.replace(regex, args[i])
  }

  return msg
}

/**
 * Gets the response to a function according to the impression level.
 *
 * @param {String} func The name of the function being called.
 * @param {Number} impression The impression level.
 * @param {String[]} args The arguments to format the string with.
 * @param {boolean} useImpressions Whether impressions are active or not.
 * @returns {String} Returns the formatted response.
 */
function getResponse (func, impression, args, useImpressions) {
  const relation = convertToRelation(useImpressions ? impression : 0)
  if (!replies.get(func)) console.error(`No replies for ${func}!`)
  const replyCands = replies.get(func)[relation]
  const replyEmoji = replyEmojis.get(func)[relation]
  if (!replyCands) console.error(`No index for ${relation}!`)
  if (!replyEmoji) console.error(`No emoji index for ${relation}!`)
  return replyEmoji + ' ' + format(replyCands[random(replyCands.length)], args)
}

/**
 * Updates the impression level of a user in a server.
 *
 * @param {Keyv} keyv The database to save to.
 * @param {Object} guildClient The guildClient associated with the server.
 * @param {String} userId The ID of the user to be updated.
 * @param {Number} value The change in the user's impression level.
 * @param {boolean} useImpressions Whether impressions are active or not.
 */
function updateImpression (keyv, guildClient, userId, value, useImpressions) {
  guildClient.logger.info(`Attempting to update impressions for ${userId}`)
  if (!useImpressions) return
  const member = guildClient.members.get(userId)
  if (member.impression + value > Config.ImpressionThresholds.MAX_IMPRESSION || member.impression + value < Config.ImpressionThresholds.MIN_IMPRESSION) return
  member.impression += value
  keyv.set(`${guildClient.guild.id}:${userId}`, value)
}

/**
 * Finds the GuildMember object associated with an identifier of some sort within a Guild.
 *
 * @param {String} str The identifier. Could be nickname, username, mention.
 * @param {Discord.Guild} guild The Guild whose members cache is to be searched.
 * @returns {Discord.GuildMember} Returns the first GuildMember associated with that identifier.
 */
function findMember (str, guild) {
  const mentionId = str.match(/^<@!?(\d+)>$/)
  let id
  if (mentionId) id = mentionId[1]

  return guild.members.cache.find(u =>
    u.user.username === str ||
    u.displayName === str ||
    (u.nickname && u.nickname === str) ||
    (id && u.id === id))
}

/**
 * Replaces the mentions in a message with their display name.
 *
 * @param {String} msg The message to be formatted.
 * @param {Discord.Guild} guild The Guild whose members cache is to be searched for display names.
 * @returns {String} Returns the formatted string.
 */
function replaceMentions (msg, guild) {
  if (msg instanceof Discord.MessageEmbed) return msg
  const regex = /<@!?(\d+)>/gi
  return msg.replace(regex, match => findMember(match, guild).displayName)
}

/**
 * Sends a message through the text channel.
 *
 * @param {Discord.TextChannel} textChannel The TextChannel to send the message to.
 * @param {String|Discord.MessageEmbed} msg The message to be sent.
 * @param {Object?} guildClient The guildClient associated with the TextChannel server.
 * @param {Object?} opts Any additional options to send the message with.
 * @returns {Discord.Message|Discord.Message[]} Returns the message(s) sent.
 */
async function sendMsg (textChannel, msg, guildClient, opts) {
  if (guildClient) {
    guildClient.logger.info('Attempting to send message')
    guildClient.logger.debug(msg)
  }
  if (!textChannel) return undefined
  if (guildClient && !guildClient.settings.mentions) msg = replaceMentions(msg, guildClient.guild)
  let msgs
  if (opts) msgs = await textChannel.send(msg, opts)
  else msgs = await textChannel.send(msg)
  return msgs
}

/**
 * Deletes a guildClient if it has been inactive for a certain amount of time.
 *
 * If the guildClient has an active voice connection, notify through the TextChannel and mark the guildClient
 * for deletion to be handled by the voiceStateUpdate event before leaving the voice channel.
 *
 * @param {Object} guildClient The guildClient to be checked for expiration.
 * @param {Discord.Client} botClient The Client of the active bot.
 */
function cleanupGuildClient (guildClient, botClient) {
  if (Date.now() - guildClient.lastCalled >= Config.TIMEOUT) {
    guildClient.logger.info('Attempting to clean up')
    // If the guild is currently connected, is not playing music, and has an active TextChannel,
    // notify, mark the guildClient for deletion, and leave
    if (guildClient.textChannel && guildClient.connection && !guildClient.playing) {
      guildClient.logger.trace('Leaving voice channel')
      sendMsg(guildClient.textChannel,
        `${Emojis.happy} **It seems nobody needs me right now, so I'll be headed out. Call me when you do!**`,
        guildClient)
      guildClient.delete = true
      guildClient.voiceChannel.leave()
    } else {
      guildClient.logger.trace('Deleting guildClient')
      botClient.guildClients.delete(guildClient.guild.id)
    }
  }
}

/**
 * Plays silence frames in a voice channel.
 *
 * Necessary for 'speaking' event to continue functioning.
 *
 * @param {Object} guildClient The guildClient associated with the voice channel's server.
 */
function playSilence (guildClient) {
  guildClient.logger.debug('Playing silence')
  const silence = new Streams.Silence()
  const dispatcher = guildClient.connection.play(silence, { type: 'opus' })
  dispatcher.on('finish', () => {
    silence.destroy()
    dispatcher.destroy()
    guildClient.logger.debug('Destroyed silence stream')
  })
}

module.exports = {
  Embeds: {
    createVideoEmbed: createVideoEmbed,
    createSearchEmbed: createSearchEmbed,
    createAboutEmbed: createAboutEmbed,
    createSettingsEmbed: createSettingsEmbed
  },
  Responses: {
    greetings: greetings,
    farewells: farewells,
    getResponse: getResponse
  },
  Functions: {
    random: random,
    updateImpression: updateImpression,
    findMember: findMember,
    sendMsg: sendMsg,
    cleanupGuildClient: cleanupGuildClient,
    playSilence: playSilence
  }
}
