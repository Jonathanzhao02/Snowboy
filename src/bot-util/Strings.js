const Common = require('./Common')
const Levenshtein = require('fastest-levenshtein')
const Fs = require('fs')
const Functions = require('./Functions')
const Discord = require('discord.js')
const CsvParse = require('csv-parse/lib/sync')
const Pokemon = CsvParse(Fs.readFileSync(Common.defaultResdir + '/pokemon.csv').toString('utf-8')).map(val => val[1])

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

/**
 * Returns the closest Pokemon name to a string.
 *
 * @param {String} string The string to lookup.
 * @returns {String} Returns the closest pokemon name.
 */
function closestPokemon (string) {
  return Levenshtein.closest(string, Pokemon)
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
    await Functions.forEachAsync(msg, async (val, index) => {
      msg[index] = await replaceMentions(val, guild)
    })
    return msg
  } else if (msg instanceof Discord.MessageEmbed) {
    return msg
  } else {
    const regex = /<@!?(\d+)>/gi
    return replaceAsync(msg, regex, async match => { return (await Functions.findMember(match, guild)).displayName })
  }
}

/**
 * Capitalizes a string split by spaces to look more proper.
 *
 * @param {String | String[]} str The string or string array to capitalize.
 * @returns {String} Returns the capitalized string.
 */
function capitalize (str) {
  if (str instanceof Array) return str.map(capitalize)
  else return str.split(' ').map(val => val.charAt(0).toUpperCase() + val.slice(1)).join(' ')
}

/**
 * Beautifies (makes cursive) a string.
 *
 * @param {String} str The string to beautify.
 * @returns {String} Returns the beautified string.
 */
function beautify (str) {
  let res = ''
  const capitalPhrase = capitalize(str)
  capitalPhrase.split('').forEach(val => {
    res += toScript(val)
  })
  return res
}

module.exports = {
  closestPokemon: closestPokemon,
  formatList: formatList,
  replaceMentions: replaceMentions,
  capitalize: capitalize,
  beautify: beautify
}
