const Discord = require('discord.js')
const Https = require('https')

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
      Discord.Permissions.FLAGS.READ_MESSAGE_HISTORY,
      Discord.Permissions.FLAGS.ADD_REACTIONS
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
      Discord.Permissions.FLAGS.DEAFEN_MEMBERS,
      Discord.Permissions.FLAGS.MOVE_MEMBERS
    ])).toArray()

    if (voiceMissingPermissions.length > 0) return voiceMissingPermissions
  }
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

module.exports = {
  random: random,
  forEachAsync: forEachAsync,
  validateURL: validateURL,
  checkTextPermissions: checkTextPermissions,
  checkVoicePermissions: checkVoicePermissions,
  findMember: findMember
}
