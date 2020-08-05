const Discord = require('discord.js')
const Common = require('./Common')
const Streams = require('../structures/Streams')
const Https = require('https')
const Resampler = require('node-libsamplerate')

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
  if (!textChannel) {
    Common.logger.warn('Attempted to send %o, but no text channel found!', msg)
    return
  }
  Common.logger.debug('Attempting to send %o to %s', msg, textChannel.name)
  if (mentions === false) msg = await replaceMentions(msg, textChannel.guild)
  let msgs
  if (opts) msgs = await textChannel.send(msg, opts)
  else msgs = await textChannel.send(msg)
  return msgs
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

function validateURL (url) {
  return new Promise((resolve, reject) => {
    Https.request(url, resp => {
      if (resp.statusCode === 200) resolve()
      else reject(new Error('Invalid status code'))
    }).end()
  })
}

/**
 * Creates a processed audio stream listening to a GuildMember.
 *
 * Returned stream is formatted 16kHz, mono, 16-bit, little-endian, signed integers.
 * @param {Discord.GuildMember} member The GuildMember to listen to.
 * @param {Discord.VoiceReceiver} receiver The receiver to create the connection from.
 * @returns {ReadableStream} Returns a stream to read audio data from.
 */
function createAudioStream (member, receiver) {
  Common.logger.debug('Attempting to create audio stream for %s in %s', member.displayName, member.guild.name)
  const audioStream = receiver.createStream(member, {
    mode: 'pcm',
    end: 'manual'
  })
  // Turns from stereo to mono
  const transformStream = new Streams.TransformStream()
  // Turns from 48k to 16k
  const resample = new Resampler({
    type: 3,
    channels: 1,
    fromRate: 48000,
    fromDepth: 16,
    toRate: 16000,
    toDepth: 16
  })

  // Ensures proper stream cleanup
  resample.on('close', () => {
    transformStream.removeAllListeners()
    audioStream.removeAllListeners()
    resample.removeAllListeners()
    transformStream.destroy()
    audioStream.destroy()
    resample.destroy()
  })
  return audioStream.pipe(transformStream).pipe(resample)
}

module.exports = {
  random: random,
  forEachAsync: forEachAsync,
  formatList: formatList,
  sendMsg: sendMsg,
  playSilence: playSilence,
  validateURL: validateURL,
  createAudioStream: createAudioStream
}
