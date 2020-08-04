module.exports = function (client, Common) {
  client.guildClients = new Map() // to keep track of individual active guilds
  client.userClients = new Map() // to keep track of individual user bug reports

  // On discord.js error
  client.on('error', error => {
    throw error
  })

  // Switch between testing bot and (future) production bot
  if (process.argv.includes('-t') || process.argv.includes('--test')) {
    client.login(process.env.TEST_BOT_TOKEN)
  } else {
    client.login(process.env.SNOWBOY_BOT_TOKEN)
  }

  Common.set('client', client)
}
