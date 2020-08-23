module.exports = function (client, logger) {
  // Sends greeting message when joining a new guild
  client.on('guildCreate', guild => {
    logger.info('Joined new guild: %s : %s', guild.id, guild.name)
    let channel = guild.systemChannel
    guild.channels.forEach(c => {
      if (c.type === 'text' && !channel) channel = c
    })
    if (channel) {
      channel.send('**Hi! Thank you for adding me to the server!**\n' +
        ' - My name is Snowboy. Just say my name while I\'m in your channel to call me.\n' +
        ' - My default prefix is `%`, but you can change that using the `settings` command.\n' +
        ' - If you have trouble remembering my commands, just use the `help` command to list them all out.\n' +
        ' - If you find any bugs with me, feel free to shoot me a DM about it. Please keep the report to one message!\n' +
        '**Please note that I\'m still in testing, so I \\*may\\* shut down frequently!**')
    }
  })
}
