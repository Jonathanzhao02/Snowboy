const Discord = require('discord.js')
const Common = require('../common')
const Config = require('../config')
const Emojis = require('../emojis')
const Streams = require('../streams')

// NOT EXPORTED

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

// EXPORTED

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

module.exports = {
  random: random,
  forEachAsync: forEachAsync,
  formatList: formatList,
  sendMsg: sendMsg,
  startTimeout: startTimeout,
  cleanupGuildClient: cleanupGuildClient,
  playSilence: playSilence
}
