const Common = require('../../bot-util/Common')

module.exports = function (client) {
  // Sends greeting message when joining a new guild
  client.on('guildCreate', guild => {
    Common.logger.info('Joined new guild: %s : %s', guild.id, guild.name)
    guild.systemChannel.send('**Hi! Thank you for adding me to the server!**\n' +
    ' - My name is Snowboy. Just say my name while I\'m in your channel to call me.\n' +
    ' - My default prefix is `%`, but you can change that using the `settings` command.\n' +
    ' - If you have trouble remembering my commands, just use the `help` command to list them all out.\n' +
    ' - If you find any bugs with me, feel free to shoot me a DM about it. Please keep the report to one message!\n' +
    '**Please note that I\'m still in testing, so I \\*may\\* shut down frequently!**')
  })
}
