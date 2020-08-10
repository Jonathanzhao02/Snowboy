const { spawn } = require('child_process')
const commands = require('./CommandMap')

/**
 * Starts the ipc server for dashboard communication.
 */
function start () {
  const dashboard = spawn('node', [process.env.DASHBOARD_PATH, process.env.LOG_PATH])
  dashboard.stdout.on('data', data => {
    console.log(data.toString())
    const message = data.toString()
    const args = message.split(/ +/)
    const commandName = args.shift()
    if (commands.get(commandName)) {
      commands.get(commandName).execute(args)
    }
  })
  dashboard.stderr.on('data', data => {
    console.log(data.toString())
  })
}

module.exports = {
  start: start
}
