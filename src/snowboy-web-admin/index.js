const { spawn } = require('child_process')
const commands = require('./CommandMap')
let dashboard

/**
 * Starts the ipc server for dashboard communication.
 */
function start (bot, logger) {
  dashboard = spawn('node', [process.env.DASHBOARD_PATH, process.env.LOG_PATH])
  dashboard.stdout.on('data', data => {
    console.log(data.toString())
    const message = data.toString()
    const args = message.split(/ +/)
    const commandName = args.shift()
    if (commands.get(commandName)) {
      commands.get(commandName).execute(args, bot, logger)
    }
  })
  dashboard.stderr.on('data', data => {
    console.log(data.toString())
  })
}

function stop () {
  dashboard.kill()
}

process.on('exit', stop)

module.exports = {
  start: start,
  stop: stop
}
