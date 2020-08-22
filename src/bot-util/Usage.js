const FLAGS = {
  VOICE: 0, // usable through voice cmd
  TEXT: 1, // usable through text cmd
  GUILD_ONLY: 2, // only usable in guilds
  DEBUG_ONLY: 3, // only usable by debuggers
  IN_VOICE: 4 // only usable while in the same voice channel as Snowboy
}

function Usage (flags) {
  this.flags = flags
}

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

Usage.from = function (...args) {
  if (args[0].constructor.name === 'String') {
    return args.reduce((acc, val) => {
      if (!FLAGS[val]) throw new Error('Invalid flag: ' + val)
      return acc + 2 ** FLAGS[val]
    }, 0)
  } else if (args[0].constror.name === 'Number') {
    return args.reduce((acc, val) => {
      if (val > 4) throw new Error('Invalid flag: ' + val)
      return acc + 2 ** val
    }, 0)
  }
}

module.exports = Usage
