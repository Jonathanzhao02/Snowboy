const Discord = require('discord.js')
const Keyv = require('keyv')
const Resampler = require('node-libsamplerate')
const Fs = require('fs')
const Snowboy = require('./snowboy')
const Streams = require('./streams')
const Emojis = require('./emojis')
const Common = require('./common')
const Commands = require('./commands')
const GuildSettings = require('./guildSettings')
const UserSettings = require('./userSettings')
const Functions = require('./bot-util').Functions
const Responses = require('./bot-util').Responses
const Config = require('./config')
const Env = require('dotenv').config()

if (Env.error) throw Env.error

// Logging
const Heapdump = require('heapdump')
const Pino = require('pino')

const logger = Pino({
  nestedKey: 'objs',
  serializers: {
    err: Pino.stdSerializers.err
  }
}, Pino.destination(`./logs/${new Date().toISOString()}.log`))

const botClient = new Discord.Client()
botClient.guildClients = new Map() // to keep track of individual active guilds
botClient.userClients = new Map() // to keep track of individual user bug reports

const gKeyv = new Keyv(
  process.argv.includes('-t') || process.argv.includes('--testing') ? 'sqlite://db/testing.db' : 'sqlite://db/snowboy.db',
  { table: 'guilds' })
const uKeyv = new Keyv(
  process.argv.includes('-t') || process.argv.includes('--testing') ? 'sqlite://db/testing.db' : 'sqlite://db/snowboy.db',
  { table: 'users' })
gKeyv.on('error', error => { throw error })
uKeyv.on('error', error => { throw error })

Common.setClient(botClient)
Common.setGKeyv(gKeyv)
Common.setUKeyv(uKeyv)
Common.setLogger(logger)

/**
 * Creates a userClient object and updates the userClients map for a User.
 *
 * @param {Discord.User} user The user the userClient is associated with.
 * @returns {Object} Returns the created userClient.
 */
async function createUserClient (user) {
  logger.info(`Creating user construct for ${user.username}`)
  const userConstruct = {
    lastReport: 0, // the time of the user's last bug report
    impression: await uKeyv.get(`${user.id}:impression`), // the user's impression level with snowboy
    settings: await UserSettings.load(uKeyv, user.id), // custom settings for the current user
    user: user, // the User object associated with this user
    logger: logger.child({ user: user.id, name: user.username }) // The logger object to be used for this client
  }
  userConstruct.logger.debug(`Read settings for ${user.id} as ${userConstruct.settings}`)
  if (!userConstruct.settings) userConstruct.settings = new UserSettings(user.id)
  if (!userConstruct.impression) userConstruct.impression = 0
  userConstruct.logger.debug(userConstruct)
  botClient.userClients.set(user.id, userConstruct)
  return userConstruct
}

async function createGuildClient (guild, textChannel, voiceChannel) {
  logger.info(`Creating new guild construct for ${guild.name}`)
  const guildConstruct = {
    textChannel: textChannel, // text channel to listen to for commands
    voiceChannel: voiceChannel, // voice channel bot is interested in
    connection: undefined, // connection to the voice channel
    songQueue: [], // song queue
    loopState: 0, // 0 = no loop, 1 = song loop, 2 = queue loop
    members: new Map(), // information about guildmembers including id, snowclients, guildmember, and impression with snowboy
    playing: false, // whether a song is currently playing
    downloading: false, // whether a song is currently being downloaded
    guild: guild, // the corresponding guild
    lastCalled: Date.now() - 2000, // when the last command was executed
    delete: false, // set to true to mark guild for deletion upon disconnect
    purging: false, // whether the purging command is currently active
    settings: await GuildSettings.load(gKeyv, guild.id), // custom settings for the current guild
    logger: logger.child({ guild: guild.id, name: guild.name }) // pino logger
  }

  guildConstruct.logger.debug(`Read settings as ${guildConstruct.settings}`)
  if (!guildConstruct.settings) guildConstruct.settings = new GuildSettings(guild.id)
  guildConstruct.logger.debug(guildConstruct)
  botClient.guildClients.set(guild.id, guildConstruct)
}

/**
 * Handles creation of new members or new SnowClients for untracked users
 * if voice commands are enabled.
 *
 * @param {Discord.GuildMember} member The speaking GuildMember.
 * @param {Discord.Speaking} speaking The speaking state of the GuildMember.
 */
async function onSpeaking (member, speaking) {
  if (!member || speaking.equals(0) || member.id === botClient.user.id) return
  const guildClient = botClient.guildClients.get(member.guild.id)
  if (!guildClient || member.voice.channel !== guildClient.voiceChannel || !guildClient.settings.voice) return
  let mmbr = guildClient.members.get(member.id)
  let userClient = botClient.userClients.get(member.id)
  let newClient = null
  const childLogger = guildClient.logger

  // If the User is not currently tracked, create a new userConstruct object
  if (!userClient) {
    userClient = await createUserClient(member.user)
  }

  // If the GuildMember is untracked, create a new member object
  if (!mmbr) {
    childLogger.info(`Creating new member construct for ${member.displayName}`)
    const memberConstruct = {
      id: member.id,
      snowClient: newClient,
      member: member
    }

    childLogger.debug(memberConstruct)
    guildClient.members.set(member.id, memberConstruct)
    mmbr = memberConstruct
  }

  // If the member is not being listened to, create a new SnowClient and process the audio
  // through all necessary streams
  if (!mmbr.snowClient) {
    childLogger.info(`Creating SnowClient for ${member.displayName}`)
    const transformStream = new Streams.TransformStream()
    const resample = new Resampler({
      type: 3,
      channels: 1,
      fromRate: 48000,
      fromDepth: 16,
      toRate: 16000,
      toDepth: 16
    })

    const audioStream = guildClient.connection.receiver.createStream(member, {
      mode: 'pcm',
      end: 'manual'
    })

    audioStream.pipe(transformStream).pipe(resample)
    resample.on('close', () => {
      transformStream.removeAllListeners()
      audioStream.removeAllListeners()
      resample.removeAllListeners()
      transformStream.destroy()
      audioStream.destroy()
      resample.destroy()
    })
    newClient = new Snowboy.SnowClient(guildClient, member.id, userClient.settings.sensitivity)
    newClient.setLogger(childLogger.child({ user: mmbr.id }))
    newClient.on('hotword', ack)
    newClient.on('result', parse)
    newClient.on('busy', (guildClient, userId) => Functions.sendMsg(guildClient.textChannel,
      `***I'm still working on your last request, <@${userId}>!***`,
      guildClient))
    newClient.on('error', msg => {
      Functions.sendMsg(guildClient.textChannel,
        `${Emojis.error} ***Error:*** \`${msg}\``,
        guildClient)
    })
    newClient.start(resample)
    mmbr.snowClient = newClient
    childLogger.info(`Successfully created SnowClient for ${member.displayName}`)
  }
}

/**
 * Logs a bug report from Snowboy's personal DMs.
 *
 * @param {Discord.Message} msg The sent message.
 */
function bugLog (msg) {
  logger.info(`Read bug report from ${msg.author.username}`)
  const file = Fs.createWriteStream(`./bug_reports/bug_report_${msg.createdAt.toISOString()}_${msg.createdAt.getTime()}.txt`)
  file.write(msg.content)
  file.write('\n')
  file.write(`${msg.author.username}#${msg.author.discriminator}`)
  file.close()
}

/**
 * Checks permissions in a guild and returns any missing.
 *
 * @param {Object} guildClient The guildClient of the server where permissions are required.
 * @returns {String[]?} The array of missing text/voice permissions or undefined if all permissions are granted.
 */
function checkPermissions (guildClient) {
  if (guildClient.guild.me.hasPermission(Discord.Permissions.FLAGS.ADMINISTRATOR)) return
  const textPermissions = guildClient.guild.me.permissionsIn(guildClient.textChannel)
  const textMissingPermissions = new Discord.Permissions(textPermissions.missing([
    Discord.Permissions.FLAGS.VIEW_CHANNEL,
    Discord.Permissions.FLAGS.SEND_MESSAGES,
    Discord.Permissions.FLAGS.MANAGE_MESSAGES,
    Discord.Permissions.FLAGS.EMBED_LINKS,
    Discord.Permissions.FLAGS.ATTACH_FILES,
    Discord.Permissions.FLAGS.READ_MESSAGE_HISTORY
  ])).toArray()

  if (textMissingPermissions.length > 0) return textMissingPermissions

  if (guildClient.voiceChannel) {
    const voicePermissions = guildClient.guild.me.permissionsIn(guildClient.voiceChannel)
    console.log(voicePermissions.toArray())
    const voiceMissingPermissions = new Discord.Permissions(voicePermissions.missing([
      Discord.Permissions.FLAGS.VIEW_CHANNEL,
      Discord.Permissions.FLAGS.CONNECT,
      Discord.Permissions.FLAGS.SPEAK,
      Discord.Permissions.FLAGS.DEAFEN_MEMBERS
    ])).toArray()

    if (voiceMissingPermissions.length > 0) return voiceMissingPermissions
  }
}

/**
 * Formats a list of strings into a fancy array.
 * @param {String[]} list The list of strings.
 * @returns {String[]} An array of strings with fancy markdown formatting.
 */
function formatList (list) {
  const msg = []
  list.forEach(val => {
    msg.push(`\`${val}\``)
  })
  return msg
}

/**
 * Parses the user's text commands.
 *
 * Handles bug reports, guildClient and member
 * creation, and the expiration timer.
 *
 * @param {Discord.Message} msg The sent message.
 */
async function onMessage (msg) {
  // If it is an automated message of some sort, return
  if (msg.author.bot || msg.system) return

  // Create a new userConstruct if the User is not currently tracked, loading settings from database
  if (!botClient.userClients.get(msg.author.id)) {
    await createUserClient(msg.author)
  }

  // If it is in Snowboy's DMs, log a new bug report and start the 24 hour cooldown.
  if (msg.channel instanceof Discord.DMChannel) {
    logger.info(`Received message in DM: ${msg}`)
    if (Date.now() - botClient.userClients.get(msg.author.id).lastReport < 86400000) {
      logger.info(`Rejected bug report from ${msg.author.username}`)
      Functions.sendMsg(msg.channel, '**Please only send a bug report every 24 hours!**')
    } else {
      logger.info(`Accepting bug report from ${msg.author.username}`)
      botClient.userClients.get(msg.author.id).lastReport = Date.now()
      bugLog(msg)
      Functions.sendMsg(msg.channel, '***Logged.*** **Thank you for your submission!**')
    }
    return
  }

  const userId = msg.author.id
  let guildClient = botClient.guildClients.get(msg.guild.id)

  // Create a new guildClient if the Guild is not currently tracked, loading settings from database
  if (guildClient) {
    guildClient = await createGuildClient(msg.guild, msg.channel, msg.member.voice.channel)
  }

  const args = msg.content.slice(guildClient.settings.prefix.length).trim().split(/ +/)
  const commandName = args.shift().toLowerCase()

  // Check that Snowboy has all necessary permissions in text channel and voice channel
  const missingPermissions = checkPermissions(guildClient)

  if (missingPermissions) {
    Functions.sendMsg(msg.channel,
      `${Emojis.error} ***Please ensure I have all the following permissions! I won't completely work otherwise!***`,
      guildClient)
    Functions.sendMsg(msg.channel, formatList(missingPermissions), guildClient)
    return
  }

  // If the message is not a command for Snowboy, return
  if (!msg.content.startsWith(guildClient.settings.prefix)) return

  // If there is no TextChannel associated with the guildClient, associate the current one
  if (!guildClient.textChannel) guildClient.textChannel = msg.channel

  // If Snowboy is currently connected in the guild, and the GuildMember tries to run a restricted command (affects Snowboy's behavior
  // in the voice channel), notify the GuildMember and return
  if (msg.channel !== guildClient.textChannel && guildClient.connection && Commands.restrictedCommands.get(commandName)) {
    Functions.sendMsg(msg.channel, `${Emojis.error} ***Sorry, I am not actively listening to this channel!***`, guildClient)
    return
  // If Snowboy is currently connected in the guild, and the GuildMember tries to run a restricted command without being in the active
  // voice channel, notify the GuildMember and return
  } else if (guildClient.connection && msg.member.voice.channelID !== guildClient.voiceChannel.id && Commands.restrictedCommands.get(commandName)) {
    Functions.sendMsg(msg.channel, `${Emojis.error} ***Sorry, you are not in my voice channel!***`, guildClient)
    return
  }

  // Create a new member if the GuildMember is not currently tracked, loading settings from database
  if (!guildClient.members.get(userId)) {
    guildClient.logger.info(`Creating new member construct for ${msg.member.displayName}`)
    const memberConstruct = {
      id: userId, // the user's discord id
      snowClient: undefined, // the snowclient listening to the member
      member: msg.member // the guildmember object of the member within the guild
    }

    guildClient.logger.debug(memberConstruct)
    guildClient.members.set(userId, memberConstruct)
  }

  guildClient.logger.info(`Received ${msg.content}`)
  guildClient.logger.debug(`Understood command as ${commandName} and arguments as ${args}`)

  // If the Guild is sending commands too fast, notify and return
  if (msg.createdAt.getTime() - guildClient.lastCalled < 1000) {
    guildClient.logger.info('Rejecting message, too fast')
    Functions.sendMsg(guildClient.textChannel, `${Emojis.error} ***Please only send one command a second!***`, guildClient)
    return
  }

  // Check all relevant command maps for the current command name, and execute it
  if (Commands.biCommands.get(commandName)) {
    Commands.biCommands.get(commandName).execute(guildClient, userId, args)
  } else if (Commands.restrictedCommands.get(commandName)) {
    Commands.restrictedCommands.get(commandName).execute(guildClient, userId, args)
  } else if (Commands.textOnlyCommands.get(commandName)) {
    Commands.textOnlyCommands.get(commandName).execute(guildClient, userId, args, msg)
  } else if (Config.DEBUG_IDS.includes(userId) && Commands.debugCommands.get(commandName)) {
    Commands.debugCommands.get(commandName).execute(guildClient, userId, args)
  } else if (Commands.eastereggCommands.get(commandName)) {
    Commands.eastereggCommands.get(commandName).execute(guildClient, userId, args)
  } else {
    Functions.sendMsg(msg.channel, `${Emojis.confused} ***Sorry, I don't understand.***`, guildClient)
  }

  // Start the expiration timer
  guildClient.logger.info('Starting expiration timer')
  guildClient.lastCalled = Date.now()
  setTimeout(() => { Functions.cleanupGuildClient(guildClient, botClient) }, Config.TIMEOUT + 500)
}

/**
 * Parses the user's voice commands.
 *
 * Matches the intents identified by
 * Wit to available commands.
 *
 * @param {Object} result The JSON object returned by Wit.
 * @param {Object} guildClient The guildClient handling this server.
 * @param {String} userId The user ID of the speaker.
 */
function parse (result, guildClient, userId) {
  if (!guildClient || !guildClient.settings.voice) return
  guildClient.logger.info(`Received results: ${result.text}, ${result.intents}`)

  // Checks that the user's voice has been parsed to some degree
  if (!result || !result.intents || !result.intents[0] || result.intents[0].confidence < Config.CONFIDENCE_THRESHOLD) {
    guildClient.logger.debug('Rejected voice command')
    guildClient.logger.debug(result)
    Functions.sendMsg(guildClient.textChannel, `${Emojis.unknown} ***Sorry, I didn't catch that...***`, guildClient)
    return
  }

  const commandName = result.intents[0].name.toLowerCase()
  const args = result.entities['wit$search_query:search_query'][0].body.toLowerCase().split(' ')
  guildClient.logger.debug(`Understood command as ${commandName} and arguments as ${args}`)

  // Checks all relevant command maps
  if (Commands.biCommands.get(commandName)) {
    Commands.biCommands.get(commandName).execute(guildClient, userId, args)
  } else if (Commands.restrictedCommands.get(commandName)) {
    Commands.restrictedCommands.get(commandName).execute(guildClient, userId, args)
  } else if (Commands.voiceOnlyCommands.get(commandName)) {
    Commands.voiceOnlyCommands.get(commandName).execute(guildClient, userId, args)
  } else if (Commands.eastereggCommands.get(commandName)) {
    Commands.eastereggCommands.get(commandName).execute(guildClient, userId, args)
  } else {
    Functions.sendMsg(guildClient.textChannel, `${Emojis.confused} ***Sorry, I don't understand*** "\`${result.text}\`"`, guildClient)
    guildClient.logger.warn(`No command found for ${commandName}!`)
  }
}

/**
 * Callback for when Snowboy detects a hotword has been spoken.
 *
 * Resets the guildClient's expiration timer and notifies the user
 * through the guild's text channel.
 *
 * @param {Number} index The index of the detected hotword in the model. Always 0.
 * @param {String} hotword The detected hotword. Always 'snowboy'.
 * @param {Object} guildClient The guildClient handling this server.
 * @param {String} userId The user ID of the speaker.
 */
function ack (index, hotword, guildClient, userId) {
  if (!guildClient.connection) return
  const userClient = botClient.userClients.get(userId)
  guildClient.logger.info(`Received hotword from ${userId}`)
  Functions.sendMsg(guildClient.textChannel,
    `**${Responses.getResponse('hotword',
      botClient.userClients.get(userId).impression,
      [`<@${userId}>`],
      userClient.settings.impressions)}**`,
    guildClient)

  // Start the expiration timer
  guildClient.logger.info('Starting expiration timer')
  guildClient.lastCalled = Date.now()
  setTimeout(() => { Functions.cleanupGuildClient(guildClient, botClient) }, Config.TIMEOUT + 500)
}

// Setting up more callbacks
botClient.on('message', onMessage)
botClient.on('guildMemberSpeaking', onSpeaking)
botClient.on('voiceStateUpdate', (oldPresence, newPresence) => {
  const guildClient = botClient.guildClients.get(newPresence.guild.id)
  const userId = newPresence.id

  // If bot is currently connected, the channel in question is the bot's channel, and a user has left or moved channels
  if (guildClient && guildClient.voiceChannel && oldPresence.channelID === guildClient.voiceChannel.id &&
    (!newPresence.channelID || newPresence.channelID !== guildClient.voiceChannel.id)) {
    guildClient.logger.info('User has left the voice channel')

    // If user is being listened to, stop listening
    if (guildClient.members.get(userId)) {
      guildClient.logger.info(`Stopping SnowClient for ${newPresence.member.displayName}`)
      const snowClient = guildClient.members.get(userId).snowClient
      if (snowClient) {
        snowClient.stop()
      }
      guildClient.members.get(userId).snowClient = undefined
    }

    // If the bot has been disconnected, clean up the guildClient
    if (userId === botClient.user.id && !newPresence.channelID) {
      guildClient.logger.info('Bot disconnected, cleaning up...')
      Commands.restrictedCommands.get('leave').execute(guildClient)
    }

    // If the bot has been left alone in a channel, wait a few seconds before leaving
    if (oldPresence.channel.members.size === 1 && userId !== botClient.user.id) {
      guildClient.logger.info('Started alone timeout timer')
      setTimeout(() => {
        // Check again that the channel is empty before leaving
        if (oldPresence.channel.members.size === 1) {
          guildClient.logger.info('Leaving channel, only member remaining')
          Functions.sendMsg(guildClient.textChannel, `${Emojis.sad} I'm leaving, I'm all by myself!`, guildClient)
          Commands.restrictedCommands.get('leave').execute(guildClient)
        }
      }, Config.ALONE_TIMEOUT + 500)
    }

    // If the bot has disconnected and the guildClient is marked for deletion, delete it
    if (userId === botClient.user.id && !newPresence.channelID && guildClient.delete) {
      guildClient.logger.info('Deleting guild client')
      botClient.guildClients.delete(guildClient.guild.id)
    }
  }
})

// Logs that the client is ready in console
botClient.on('ready', () => {
  logger.info(`Logged in as ${botClient.user.tag}`)
  logger.info(`Started up at ${new Date().toString()}`)
})

// Sends greeting message when joining a new guild
botClient.on('guildCreate', guild => {
  logger.info(`Joined new guild: ${guild.id} : ${guild.name}`)
  guild.systemChannel.send('**Hi! Thank you for adding me to the server!**\n' +
  ' - My name is Snowboy. Just say my name while I\'m in your channel to call me.\n' +
  ' - My default prefix is `%`, but you can change that using the `settings` command.\n' +
  ' - If you have trouble remembering my commands, just use the `help` command to list them all out.\n' +
  ' - If you find any bugs with me, feel free to shoot me a DM about it. Please keep the report to one message!\n' +
  '**Please note that I\'m still in testing, so I \\*may\\* shut down frequently!**')
})

// On discord.js error
botClient.on('error', error => {
  const promise = new Promise((resolve, reject) => {
    const guilds = Array.from(botClient.guildClients)
    guilds.forEach((guildClient, index, array) => {
      guildClient[1].logger.debug('Sending error message')
      Functions.sendMsg(guildClient[1].textChannel, `${Emojis.skull} ***Sorry, I ran into some fatal error. Hopefully I come back soon!***`).then(() => {
        if (index === array.length - 1) resolve()
      })
    })

    if (guilds.length === 0) resolve()
  })

  promise.then(() => Heapdump.writeSnapshot(`./logs/${new Date().toISOString()}_CLI.heapdump`, (err, filename) => {
    logger.error('Client exception')
    logger.error(error)
    console.log(error)
    if (err) process.exit(1)
    logger.debug(`Heapdump written to ${filename}`)
    botClient.destroy()
    process.exit(1)
  }))
})

// On uncaught exception
process.on('uncaughtException', error => {
  Heapdump.writeSnapshot(`./logs/${new Date().toISOString()}_ERR.heapdump`, (err, filename) => {
    logger.error('Uncaught exception')
    logger.error(error)
    console.log(error)
    botClient.destroy()
    if (err) process.exit(1)
    logger.debug(`Heapdump written to ${filename}`)
    process.exit(1)
  })
})

// On unhandled promise rejection
process.on('unhandledRejection', (error, promise) => {
  Heapdump.writeSnapshot(`./logs/${new Date().toISOString()}_REJ.heapdump`, (err, filename) => {
    logger.error('Unhandled promise rejection')
    logger.error(promise)
    logger.error(error)
    console.log(error)
    botClient.destroy()
    if (err) process.exit(1)
    logger.debug(`Heapdump written to ${filename}`)
    process.exit(1)
  })
})

// On process termination (exits normally)
process.on('SIGTERM', signal => {
  logger.info(`Process ${process.pid} received a SIGTERM signal`)
  botClient.destroy()
  process.exit(0)
})

// On process interrupt
process.on('SIGINT', signal => {
  logger.info(`Process ${process.pid} has been interrupted`)
  const promise = new Promise((resolve, reject) => {
    const guilds = Array.from(botClient.guildClients)
    guilds.forEach((guildClient, index, array) => {
      if (guildClient[1]) guildClient[1].logger.debug('Sending interrupt message')
      Functions.sendMsg(guildClient[1].textChannel, `${Emojis.joyful} ***Sorry, I'm going down for updates and maintenance! See you soon!***`).then(() => {
        if (index === array.length - 1) resolve()
      })
    })

    if (guilds.length === 0) resolve()
  })

  promise.then(() => {
    botClient.destroy()
    process.exit(0)
  })
})

// Determines log level
if (process.argv.includes('trace')) {
  logger.level = 'trace'
} else if (process.argv.includes('debug')) {
  logger.level = 'debug'
} else if (process.argv.includes('info')) {
  logger.level = 'info'
} else if (process.argv.includes('warn')) {
  logger.level = 'warn'
} else if (process.argv.includes('error')) {
  logger.level = 'error'
} else if (process.argv.includes('fatal')) {
  logger.level = 'fatal'
} else if (process.argv.includes('silent')) {
  logger.level = 'silent'
}

// Switch between testing bot and (future) production bot
if (process.argv.includes('-t') || process.argv.includes('--test')) {
  botClient.login(process.env.TEST_BOT_TOKEN)
} else {
  botClient.login(process.env.SNOWBOY_BOT_TOKEN)
}
