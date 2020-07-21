const fs = require('fs')

// Commands
const commands = new Map([
  ['biCommands', { path: './commands/biCommands', map: new Map() }],
  ['restrictedCommands', { path: './commands/restrictedCommands', map: new Map() }],
  ['voiceOnlyCommands', { path: './commands/voiceCommands', map: new Map() }],
  ['textOnlyCommands', { path: './commands/textCommands', map: new Map() }],
  ['debugCommands', { path: './commands/debugCommands', map: new Map() }],
  ['eastereggCommands', { path: './commands/eastereggCommands', map: new Map() }]
])

commands.forEach((obj, index) => {
  const cmds = fs.readdirSync(obj.path).filter(file => file.endsWith('.js'))
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
