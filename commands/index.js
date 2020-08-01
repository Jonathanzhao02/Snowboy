const fs = require('fs')
const path = require('path')

// Commands
const commands = new Map([
  ['bi', { path: './bi', map: new Map() }],
  ['restricted', { path: './restricted', map: new Map() }],
  ['voice', { path: './voice', map: new Map() }],
  ['text', { path: './text', map: new Map() }],
  ['debug', { path: './debug', map: new Map() }],
  ['easteregg', { path: './easteregg', map: new Map() }]
])

commands.forEach((obj, index) => {
  const cmds = fs.readdirSync(path.resolve(__dirname, obj.path)).filter(file => file.endsWith('.js'))
  cmds.forEach(file => {
    const command = require(`${obj.path}/${file}`)
    if (command.aliases) {
      command.aliases.forEach(alias => {
        if (obj.map.get(alias)) { throw new Error(`Collision between ${alias}!`) }
        obj.map.set(alias, command)
      })
    }
    if (obj.map.get(command.name)) { throw new Error(`Collision between ${command.name}!`) }
    obj.map.set(command.name, command)
  })
  module.exports[index] = obj.map
})
