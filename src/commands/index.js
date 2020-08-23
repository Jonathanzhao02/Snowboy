const Fs = require('fs')
const Path = require('path')
const Usage = require('../bot-util/Usage')

/**
 * bi: Usable in voice or text
 * text: Only usable in text
 * voice: Only usable in voice
 * debug: Usable only by authorized users.
 * easteregg: Usable in voice/text, not listed in help
 * restricted: Usable in voice/text, only by members in the same voice channel
 */

// Commands
const commands = new Map([
  ['bi', { path: './bi' }],
  ['text', { path: './text' }],
  ['voice', { path: './voice' }],
  ['debug', { path: './debug' }],
  ['easteregg', { path: './easteregg' }],
  ['restricted', { path: './restricted' }]
])

const allCommands = new Map()

commands.forEach((obj) => {
  const cmds = Fs.readdirSync(Path.resolve(__dirname, obj.path)).filter(file => file.endsWith('.js'))
  cmds.forEach(file => {
    const command = require(`${obj.path}/${file}`)
    command.usages = new Usage(Usage.from(command.usages))
    if (command.aliases) {
      command.aliases.forEach(alias => {
        if (allCommands.get(alias)) { throw new Error(`Collision between ${alias}!`) }
        allCommands.set(alias, command)
      })
    }
    if (allCommands.get(command.name)) { throw new Error(`Collision between ${command.name}!`) }
    allCommands.set(command.name, command)
  })
})

module.exports = allCommands
