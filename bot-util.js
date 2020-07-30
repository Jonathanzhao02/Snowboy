const Entities = require('html-entities').Html5Entities
const Discord = require('discord.js')
const Emojis = require('./emojis')
const Streams = require('./streams')
const Config = require('./config')
const GuildSettings = require('./guildSettings')
const UserSettings = require('./userSettings')
const Common = require('./common')

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
 * Updates the impression level of a user.
 *
 * @param {Keyv} keyv The Keyv database to save to.
 * @param {String} key The key of the user to be updated.
 * @param {Object} client The object containing the impression to be updated.
 * @param {Number} value The change in the user's impression level.
 * @param {boolean} useImpressions If the impression system is in use or not.
 */
function updateImpression (keyv, key, client, value, useImpressions) {
  if (useImpressions === false) return
  Common.logger.info(`Attempting to update impressions for ${key}`)
  if (client.impression + value > Config.ImpressionThresholds.MAX_IMPRESSION || client.impression + value < Config.ImpressionThresholds.MIN_IMPRESSION) return
  client.impression += value
  keyv.set(`${key}`, value)
}

/**
 * Finds the GuildMember object associated with a mention string.
 *
 * @param {String} str The mention string.
 * @param {Discord.Guild} guild The Guild whose members cache is to be searched.
 * @returns {Discord.GuildMember} Returns the first GuildMember associated with that identifier.
 */
async function findMember (str, guild) {
  const mentionId = str.match(/^<@!?(\d+)>$/)
  if (!mentionId) return
  return await guild.members.fetch(mentionId[1])
}

/**
 * Function to asynchronously replace mentions in a message.
 *
 * Ripped from StackOverflow.
 *
 * @param {String} str The string to replace.
 * @param {RegExp} regex The regular expression to match.
 * @param {Function} asyncFn The asynchronous function to run.
 */
async function replaceAsync (str, regex, asyncFn) {
  const promises = []
  str.replace(regex, (match, ...args) => {
    const promise = asyncFn(match, ...args)
    promises.push(promise)
  })
  const data = await Promise.all(promises)
  return str.replace(regex, () => data.shift())
}

/**
 * Function to asynchronously iterate over an array.
 *
 * @param {Array} ar The Array to be iterated over.
 * @param {Function} asyncFn The asynchronous function to be called.
 */
async function forEachAsync (ar, asyncFn) {
  for (let i = 0; i < ar.length; i++) {
    await asyncFn(ar[i], i, ar)
  }
}

/**
 * Formats a list of strings into a fancy array.
 * @param {String[]} list The list of strings.
 * @returns {String[]} An array of strings with fancy markdown formatting.
 */
function formatList (list) {
  const msg = []
  list.forEach(val => {
    msg.push(`\`${val}\``)
  })
  return msg
}

/**
 * Replaces the mentions in a message with their display name.
 *
 * @param {String[] | String} msg The message(s) to be formatted.
 * @param {Discord.Guild} guild The Guild whose members cache is to be searched for display names.
 * @returns {String[] | String} Returns the formatted message(s).
 */
async function replaceMentions (msg, guild) {
  if (msg instanceof Array) {
    await forEachAsync(msg, async (val, index) => {
      msg[index] = await replaceMentions(val, guild)
    })
    return msg
  } else if (msg instanceof Discord.MessageEmbed) {
    return msg
  } else {
    const regex = /<@!?(\d+)>/gi
    return replaceAsync(msg, regex, async match => { return (await findMember(match, guild)).displayName })
  }
}

/**
 * Gets userClient, guildClient, and memberClient from a GuildMember, if they exist.
 *
 * @param {Discord.GuildMember} member The GuildMember to fetch the clients for.
 * @returns {Object} Returns an object containing all existing clients.
 */
function getClientsFromMember (member) {
  Common.logger.info(`Fetching clients for ${member}`)
  // Get the userClient
  const userClient = Common.botClient.userClients.get(member.id)
  if (!userClient) Common.logger.warn(`No userClient found for ${member.id}!`)

  // Get the guildClient
  const guildClient = Common.botClient.guildClients.get(member.guild.id)
  if (!guildClient) Common.logger.warn(`No guildClient found for ${member.guild.id}!`)

  // Get the memberClient
  const memberClient = guildClient.memberClients.get(userClient.id)
  if (!memberClient) Common.logger.warn(`No memberClient found for ${member.id}!`)

  return {
    userClient: userClient,
    guildClient: guildClient,
    memberClient: memberClient
  }
}

/**
 * Sends a message through the text channel.
 *
 * @param {Discord.TextChannel} textChannel The TextChannel to send the message to.
 * @param {String | Discord.MessageEmbed} msg The message to be sent.
 * @param {Boolean?} mentions Whether mentions should be replaced with names.
 * @param {Object?} opts Any additional options to send the message with.
 * @returns {Discord.Message | Discord.Message[]} Returns the message(s) sent.
 */
async function sendMsg (textChannel, msg, mentions, opts) {
  Common.logger.debug(`Attempting to send ${msg} to ${textChannel}`)
  if (!textChannel) return
  if (mentions === false) msg = await replaceMentions(msg, textChannel.guild)
  let msgs
  if (opts) msgs = await textChannel.send(msg, opts)
  else msgs = await textChannel.send(msg)
  return msgs
}

/**
 * Starts the timeout for cleanup of a guildClient.
 *
 * @param {Object} guildClient The guildClient to begin timing out.
 */
function startTimeout (guildClient) {
  guildClient.logger.info('Starting expiration timer')
  guildClient.lastCalled = Date.now()
  if (guildClient.timeoutId) clearTimeout(guildClient.timeoutId)
  guildClient.timeoutId = setTimeout(() => { cleanupGuildClient(guildClient) }, Config.TIMEOUT + 500)
}

/**
 * Deletes a guildClient if it has been inactive for a certain amount of time.
 *
 * If the guildClient has an active voice connection, notify through the TextChannel and mark the guildClient
 * for deletion to be handled by the voiceStateUpdate event before leaving the voice channel.
 *
 * @param {Object} guildClient The guildClient to be checked for expiration.
 */
function cleanupGuildClient (guildClient) {
  if (Date.now() - guildClient.lastCalled >= Config.TIMEOUT) {
    guildClient.logger.debug('Attempting to clean up guildClient')
    // If the guild is currently connected, is not playing music, and has an active TextChannel,
    // notify, mark the guildClient for deletion, and leave
    if (guildClient.textChannel && guildClient.connection && !guildClient.playing) {
      guildClient.logger.debug('Leaving voice channel')
      sendMsg(guildClient.textChannel,
        `${Emojis.happy} **It seems nobody needs me right now, so I'll be headed out. Call me when you do!**`,
        guildClient)
      guildClient.delete = true
      guildClient.voiceChannel.leave()
    } else {
      guildClient.logger.debug('Deleting guildClient')
      Common.botClient.guildClients.delete(guildClient.guild.id)
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

/**
 * Checks permissions in a TextChannel and returns any missing.
 *
 * @param {Discord.TextChannel} channel The TextChannel where permissions are required.
 * @returns {String[]?} The array of missing text permissions or null if all permissions are granted.
 */
function checkTextPermissions (channel) {
  if (channel.guild.me.hasPermission(Discord.Permissions.FLAGS.ADMINISTRATOR)) return
  const textPermissions = channel.guild.me.permissionsIn(channel)
  const textMissingPermissions = new Discord.Permissions(textPermissions.missing([
    Discord.Permissions.FLAGS.VIEW_CHANNEL,
    Discord.Permissions.FLAGS.SEND_MESSAGES,
    Discord.Permissions.FLAGS.MANAGE_MESSAGES,
    Discord.Permissions.FLAGS.EMBED_LINKS,
    Discord.Permissions.FLAGS.ATTACH_FILES,
    Discord.Permissions.FLAGS.READ_MESSAGE_HISTORY
  ])).toArray()

  if (textMissingPermissions.length > 0) return textMissingPermissions
}

/**
 * Checks permissions in a VoiceChannel and returns any missing.
 *
 * @param {*} channel The VoiceChannel where permissions are required.
 * @returns {String[]?} The array of missing voice permissions or null if all permissions are granted.
 */
function checkVoicePermissions (channel) {
  if (channel) {
    if (channel.guild.me.hasPermission(Discord.Permissions.FLAGS.ADMINISTRATOR)) return
    const voicePermissions = channel.guild.me.permissionsIn(channel)
    const voiceMissingPermissions = new Discord.Permissions(voicePermissions.missing([
      Discord.Permissions.FLAGS.VIEW_CHANNEL,
      Discord.Permissions.FLAGS.CONNECT,
      Discord.Permissions.FLAGS.SPEAK,
      Discord.Permissions.FLAGS.DEAFEN_MEMBERS
    ])).toArray()

    if (voiceMissingPermissions.length > 0) return voiceMissingPermissions
  }
}

module.exports = {
  Embeds: {
    createVideoEmbed: createVideoEmbed,
    createSearchEmbed: createSearchEmbed,
    createImageEmbed: createImageEmbed,
    createAboutEmbed: createAboutEmbed,
    createSettingsEmbed: createSettingsEmbed
  },
  Responses: {
    greetings: greetings,
    farewells: farewells
  },
  Functions: {
    random: random,
    findMember: findMember,
    getClientsFromMember: getClientsFromMember,
    sendMsg: sendMsg,
    startTimeout: startTimeout,
    cleanupGuildClient: cleanupGuildClient,
    playSilence: playSilence,
    forEachAsync: forEachAsync,
    formatList: formatList
  },
  Guilds: {
    checkTextPermissions: checkTextPermissions,
    checkVoicePermissions: checkVoicePermissions
  },
  Impressions: {
    getResponse: getResponse,
    updateImpression: updateImpression
  }
}
