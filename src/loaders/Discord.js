module.exports = function (client) {
  client.guildClients = new Map() // to keep track of individual active guilds
  client.userClients = new Map() // to keep track of individual user bug reports

  // On discord.js error
  client.on('error', error => {
    throw error
  })
}
