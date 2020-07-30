const Emojis = require('../emojis')
const Config = require('../config')
const Common = require('../common')
const random = require('./functions').random

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

module.exports = {
  getResponse: getResponse,
  updateImpression: updateImpression
}
