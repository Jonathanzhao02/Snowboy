const FLAGS = {
  VOICE: 0, // usable through voice cmd
  TEXT: 1, // usable through text cmd
  GUILD_ONLY: 2, // only usable in guilds
  DEBUG_ONLY: 3, // only usable by debuggers
  IN_VOICE: 4 // only usable while in the same voice channel as Snowboy
}

/**
 * Bitfield container for all usage flags.
 *
 * @param {Number | String[] | Number[]} flags The bitfield value for the combined flags.
 */
function Usage (flags) {
  if (flags.constructor.name === 'Array') {
    this.flags = Usage.from(flags)
  } else if (flags.constructor.name === 'Number') {
    this.flags = flags
  }
}

/**
 * Checks if bitfield contains these flags.
 *
 * @param {String | String[] | Number | Number[]} flag The flags to check.
 * @returns {Boolean} Returns whether the bitfield contains these flags.
 */
Usage.prototype.has = function (flag) {
  if (flag.constructor.name === 'Number') {
    return this.flags % 2 ** (flag + 1) >= 2 ** flag
  } else if (flag.constructor.name === 'Array') {
    return flag.every(val => this.has(val))
  } else if (flag.constructor.name === 'String') {
    return this.has(FLAGS[flag])
  }
}

Usage.FLAGS = FLAGS

/**
 * Creates a bitfield value from flags.
 *
 * @param {String[] | Number[]} flags The flags to create the bitfield from.
 * @returns {Number} Returns the bitfield value containing all passed flags.
 */
Usage.from = function (flags) {
  if (flags[0].constructor.name === 'String') {
    return flags.reduce((acc, val) => {
      if (!FLAGS[val] && FLAGS[val] !== 0) throw new Error('Invalid flag: ' + val)
      return acc + 2 ** FLAGS[val]
    }, 0)
  } else if (flags[0].constructor.name === 'Number') {
    return flags.reduce((acc, val) => {
      if (val > 4) throw new Error('Invalid flag: ' + val)
      return acc + 2 ** val
    }, 0)
  }
}

module.exports = Usage
