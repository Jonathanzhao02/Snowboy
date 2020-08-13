const Discord = require('discord.js')
const Https = require('https')

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

/**
 * Converts an alphabetic character to its script counterpart.
 *
 * @param {String} char The character to convert.
 * @returns {String} Returns the script character.
 */
function toScript (char) {
  const code = char.charCodeAt(0)
  switch (char) {
    case 'B':
      return '\u{212c}'
    case 'E':
      return '\u{2130}'
    case 'F':
      return '\u{2131}'
    case 'H':
      return '\u{210b}'
    case 'I':
      return '\u{2110}'
    case 'L':
      return '\u{2112}'
    case 'M':
      return '\u{2133}'
    case 'R':
      return '\u{211b}'
    case 'e':
      return '\u{212f}'
    case 'g':
      return '\u{210a}'
    case 'o':
      return '\u{2134}'
    default:
      if (code >= 65 && code <= 90) {
        return String.fromCharCode(55349) + String.fromCharCode(56463 + code)
      } else if (code >= 97 && code <= 122) {
        return String.fromCharCode(55349) + String.fromCharCode(56457 + code)
      } else {
        return char
      }
  }
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
 * @param {Array | Map} ar The Array to be iterated over.
 * @param {Function} asyncFn The asynchronous function to be called.
 */
async function forEachAsync (ar, asyncFn) {
  if (ar instanceof Array) {
    for (let i = 0; i < ar.length; i++) {
      await asyncFn(ar[i], i, ar)
    }
  } else if (ar instanceof Map) {
    const vals = Array.from(ar)
    for (let i = 0; i < vals.length; i++) {
      await asyncFn(vals[i][1], vals[i][0], vals)
    }
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
 * Checks that a URL returns a 200 status code.
 *
 * @param {String} url The https URL to access.
 * @returns {Promise} Returns a Promise that resolves if successful connection.
 */
function validateURL (url) {
  return new Promise((resolve, reject) => {
    Https.request(url, resp => {
      if (resp.statusCode === 200) resolve()
      else reject(new Error('Invalid status code'))
    }).end()
  })
}

/**
 * Checks permissions in a TextChannel and returns any missing.
 *
 * @param {Discord.TextChannel} channel The TextChannel where permissions are required.
 * @returns {String[]?} The array of missing text permissions or null if all permissions are granted.
 */
function checkTextPermissions (channel) {
  if (channel) {
    if (channel.guild.me.hasPermission(Discord.Permissions.FLAGS.ADMINISTRATOR)) return
    const textPermissions = channel.permissionsFor(channel.guild.me)
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
    const voicePermissions = channel.permissionsFor(channel.guild.me)
    const voiceMissingPermissions = new Discord.Permissions(voicePermissions.missing([
      Discord.Permissions.FLAGS.VIEW_CHANNEL,
      Discord.Permissions.FLAGS.CONNECT,
      Discord.Permissions.FLAGS.SPEAK,
      Discord.Permissions.FLAGS.DEAFEN_MEMBERS
    ])).toArray()

    if (voiceMissingPermissions.length > 0) return voiceMissingPermissions
  }
}

/**
 * Beautifies (makes cursive) a string.
 *
 * @param {String} str The string to beautify.
 * @returns {String} Returns the beautified string.
 */
function beautify (str) {
  let res = ''
  const capitalPhrase = str.split(' ').map(val => val.charAt(0).toUpperCase() + val.slice(1)).join(' ')
  capitalPhrase.split('').forEach(val => {
    res += toScript(val)
  })
  return res
}

module.exports = {
  random: random,
  forEachAsync: forEachAsync,
  formatList: formatList,
  replaceMentions: replaceMentions,
  validateURL: validateURL,
  checkTextPermissions: checkTextPermissions,
  checkVoicePermissions: checkVoicePermissions,
  beautify: beautify
}
