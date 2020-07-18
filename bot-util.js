const Entities = require('html-entities').Html5Entities
const Discord = require('discord.js')
const Emojis = require('./emojis')

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

function createSearchEmbed (result, username) {
  return new Discord.MessageEmbed()
    .setColor('#32cd32')
    .setTitle(Entities.decode(result.title))
    .setDescription(Entities.decode(result.snippet.replace('\n', '')))
    .setURL(result.link)
    .setImage(result.pagemap.cse_image[0].src)
    .setFooter(`Requested by ${username}`)
}

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

function random (bound) {
  var num = Math.floor(Math.random() * Math.floor(bound))
  return (num < bound) ? num : bound
}

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

// Descending order, <= and > previous threshold
const HATE_THRESHOLD = -66
const DISLIKE_THRESHOLD = -30
const SLIGHT_DISLIKE_THRESHOLD = -10
const NEUTRAL_THRESHOLD = 10
const SLIGHT_LIKE_THRESHOLD = 30
const LIKE_THRESHOLD = 66
const LOVE_THRESHOLD = 100

const hotwordReplies = [
  ['What?'],
  ['Huh?', 'Hmm?'],
  ['What do you want, {0}?', 'Just tell me what you need, {0}.'],
  ['Yes, {0}?', 'How can I help you, {0}?', 'What do you need, {0}?', 'Anything you need, {0}?'],
  ['How can I help you, {0}?', 'What do you need, {0}?', 'Anything I can do for you, {0}?'],
  ['What\'s up, {0}?', 'Yeah, {0}?', 'What can I do for you, {0}?'],
  ['What\'s up, {0}?', 'Yeah, {0}?']
]

const hotwordEmojis = [
  ' ',
  ' ',
  Emojis.checkmark,
  Emojis.checkmark,
  Emojis.checkmark,
  Emojis.happy,
  Emojis.happy
]

const impressionReplies = [
  ['Shut up.', 'I don\'t care.', 'Screw you.'],
  ['I don\'t like you, {0}.', 'You\'re a bit of a jerk, {0}.', 'My mother always told me if I don\'t have anything nice to say, don\'t say anything at all.'],
  ['I\'d appreciate it if you were kinder, {0}.', 'Just keep some distance, {0}.', 'I guess you\'re bearable, {0}.'],
  ['You\'re okay, {0}.', 'I guess you\'re alright, {0}.', 'Let\'s just keep this professional, huh?'],
  ['You\'re a pretty decent person, {0}.', 'I think you\'re pretty cool, {0}.', 'You\'re good in my book, {0}.'],
  ['I like you, {0}.', 'We\'re pretty tight, {0}.', 'We\'re pretty chill, {0}.'],
  ['Let\'s just say you could have intercourse with my romantic partner, {0}.', 'Man, I love you, {0}!', 'I wish I could hang out with you {0} but, you know, I\'m digital and all.']
]

const impressionEmojis = [
  Emojis.angry,
  Emojis.weird,
  Emojis.annoyed,
  Emojis.neutral,
  Emojis.content,
  Emojis.happy,
  Emojis.joyful
]

const replies = new Map()
replies.set('hotword', hotwordReplies)
replies.set('impression', impressionReplies)

const replyEmojis = new Map()
replyEmojis.set('hotword', hotwordEmojis)
replyEmojis.set('impression', impressionEmojis)

const Relation = {
  HATE: 0,
  DISLIKE: 1,
  SLIGHT_DISLIKE: 2,
  NEUTRAL: 3,
  SLIGHT_LIKE: 4,
  LIKE: 5,
  LOVE: 6
}

function convertToRelation (impression) {
  if (impression <= HATE_THRESHOLD) return Relation.HATE
  if (impression <= DISLIKE_THRESHOLD) return Relation.DISLIKE
  if (impression <= SLIGHT_DISLIKE_THRESHOLD) return Relation.SLIGHT_DISLIKE
  if (impression <= NEUTRAL_THRESHOLD) return Relation.NEUTRAL
  if (impression <= SLIGHT_LIKE_THRESHOLD) return Relation.SLIGHT_LIKE
  if (impression <= LIKE_THRESHOLD) return Relation.LIKE
  if (impression <= LOVE_THRESHOLD) return Relation.LOVE
}

function format (msg, args) {
  for (var i = 0; i < args.length; i++) {
    msg = msg.replace(`{${i}}`, args[i])
  }

  return msg
}

function getResponse (func, impression, args, useImpressions) {
  const relation = convertToRelation(useImpressions ? impression : 0)
  if (!replies.get(func)) console.error(`No replies for ${func}!`)
  const replyCands = replies.get(func)[relation]
  const replyEmoji = replyEmojis.get(func)[relation]
  if (!replyCands) console.error(`No index for ${relation}!`)
  if (!replyEmoji) console.error(`No emoji index for ${relation}!`)
  return replyEmoji + ' ' + format(replyCands[random(replyCands.length)], args)
}

const MAX_IMPRESSION = 100
const MIN_IMPRESSION = -100

function updateImpression (keyv, guildClient, userId, value, useImpressions) {
  if (!useImpressions) return
  const member = guildClient.members.get(userId)
  if (member.impression + value > MAX_IMPRESSION || member.impression + value < MIN_IMPRESSION) return
  member.impression += value
  keyv.set(`${guildClient.guild.id}:${userId}`, value)
}

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

function replaceMentions (msg, guild) {
  const regex = /<@!?(\d+)>/

  while (msg.match(regex)) {
    const group = msg.match(regex)
    msg = msg.replace(group[0], findMember(group[0]).displayName, guild)
  }

  return msg
}

async function sendMsg (textChannel, msg, guildClient, opts) {
  if (!textChannel) return undefined
  if (guildClient && guildClient.settings.mentions === 'false') msg = replaceMentions(msg, guildClient.guild)
  let msgs
  if (opts) msgs = await textChannel.send(msg, opts)
  else msgs = await textChannel.send(msg)
  return msgs
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
    sendMsg: sendMsg
  }
}
