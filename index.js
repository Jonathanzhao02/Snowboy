const Discord = require('discord.js')
const Keyv = require('keyv')
const Resampler = require('node-libsamplerate')
const Fs = require('fs')
const Snowboy = require('./snowboy')
const Wit = require('./wit')
const Streams = require('./streams')
const Emojis = require('./emojis')
const Commands = require('./commands')
const Settings = require('./settings')
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
Wit.setKey(process.env.WIT_API_TOKEN)

const keyv = new Keyv('sqlite://db/snowboy.db', { table: 'guilds' })
keyv.on('error', error => { throw error })

Commands.setClient(botClient)
Commands.setDb(keyv)
Commands.setLogger(logger)

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
  let newClient = null
  const childLogger = guildClient.logger

  // If the GuildMember is untracked, create a new member object
  if (!mmbr) {
    childLogger.info(`Creating new member construct for ${member.displayName}`)
    const memberConstruct = {
      id: member.id,
      snowClient: newClient,
      member: member,
      impression: await keyv.get(`${member.guild.id}:${member.id}:impression`)
    }

    childLogger.debug(memberConstruct)
    if (!memberConstruct.impression) memberConstruct.impression = 0
    childLogger.trace(`Read member impression as ${memberConstruct.impression}`)
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
    newClient = new Snowboy.SnowClient(guildClient, member.id, guildClient.settings.sensitivity)
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

  // If it is in Snowboy's DMs, log a new bug report and start the 24 hour cooldown.
  if (msg.channel instanceof Discord.DMChannel) {
    logger.info(`Received message in DM: ${msg}`)
    if (!botClient.userClients.get(msg.author.id)) {
      logger.info(`Creating user construct for ${msg.author.username}`)
      const userConstruct = {
        lastReport: 0
      }
      botClient.userClients.set(msg.author.id, userConstruct)
    }
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

  const guildId = msg.guild.id
  const userId = msg.author.id

  // Create a new guildClient if the Guild is not currently tracked, loading settings from database
  if (!botClient.guildClients.get(msg.guild.id)) {
    logger.info(`Creating new guild construct for ${msg.guild.name}`)
    var guildConstruct = {
      textChannel: msg.channel, // text channel to listen to for commands
      voiceChannel: msg.member.voice.channel, // voice channel bot is interested in
      connection: undefined, // connection to the voice channel
      songQueue: [], // song queue
      members: new Map(), // information about guildmembers including id, snowclients, guildmember, and impression with snowboy
      playing: false, // whether a song is currently playing
      guild: msg.guild, // the corresponding guild
      lastCalled: Date.now() - 2000, // when the last command was executed
      delete: false, // set to true to mark guild for deletion upon disconnect
      purging: false, // whether the purging command is currently active
      settings: await Settings.load(keyv, guildId), // custom settings for the current guild
      logger: logger.child({ guild: guildId, name: msg.guild.name }) // pino logger
    }

    guildConstruct.logger.debug(`Read settings as ${guildConstruct.settings}`)
    if (!guildConstruct.settings) guildConstruct.settings = new Settings(guildId)
    botClient.guildClients.set(guildId, guildConstruct)
  }

  const guildClient = botClient.guildClients.get(msg.guild.id)
  const args = msg.content.slice(guildClient.settings.prefix.length).trim().split(/ +/)
  const commandName = args.shift().toLowerCase()

  // If the message is not a command for Snowboy, return
  if (!msg.content.startsWith(guildClient.settings.prefix)) return

  // If there is no TextChannel associated with the guildClient, associate the current one
  if (!guildClient.textChannel) guildClient.textChannel = msg.channel

  // If Snowboy is currently connected in the guild, and the GuildMember tries to run a restricted command (affects Snowboy's behavior
  // in the voice channel), notify the GuildMember and return
  if (msg.channel !== guildClient.textChannel && guildClient.connection && Commands.restrictedCommands.get(commandName)) {
    Functions.sendMsg(msg.channel, `${Emojis.error} ***Sorry, I am not actively listening to this channel!***`, guildClient)
    return
  }

  // Create a new member if the GuildMember is not currently tracked, loading settings from database
  if (!guildClient.members.get(userId)) {
    guildClient.logger.info(`Creating new member construct for ${msg.member.displayName}`)
    const memberConstruct = {
      id: userId, // the user's discord id
      snowClient: undefined, // the snowclient listening to the member
      member: msg.member, // the guildmember object of the member within the guild
      impression: await keyv.get(`${guildId}:${userId}:impression`) // the member's impression level with snowboy
    }

    if (!memberConstruct.impression) memberConstruct.impression = 0
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
  if (Commands.commands.get(commandName)) {
    Commands.commands.get(commandName)(guildClient, userId, args)
  } else if (Commands.restrictedCommands.get(commandName)) {
    Commands.restrictedCommands.get(commandName)(guildClient, userId, args)
  } else if (Commands.textOnlyCommands.get(commandName)) {
    Commands.textOnlyCommands.get(commandName)(guildClient, userId, args, msg)
  } else if (Config.DEBUG_IDS.includes(userId) && Commands.debugCommands.get(commandName)) {
    Commands.debugCommands.get(commandName)(guildClient, userId, args)
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
  if (!guildClient || guildClient.settings.voice) return
  guildClient.logger.debug(`Received results: ${result.text}, ${result.intents}`)

  // Checks that the user's voice has been parsed to some degree
  if (!result || !result.intents || !result.intents[0] || result.intents[0].confidence < Config.CONFIDENCE_THRESHOLD) {
    guildClient.logger.info(`Rejected voice command: ${result}`)
    Functions.sendMsg(guildClient.textChannel, `${Emojis.unknown} ***Sorry, I didn't catch that...***`, guildClient)
    return
  }

  const commandName = result.intents[0].name.toLowerCase()
  const args = result.entities['wit$search_query:search_query'][0].body.toLowerCase().split(' ')
  guildClient.logger.debug(`Understood command as ${commandName} and arguments as ${args}`)

  // Checks all relevant command maps
  if (Commands.commands.get(commandName)) {
    Commands.commands.get(commandName)(guildClient, userId, args)
  } else if (Commands.restrictedCommands.get(commandName)) {
    Commands.restrictedCommands.get(commandName)(guildClient, userId, args)
  } else if (Commands.voiceOnlyCommands.get(commandName)) {
    Commands.voiceOnlyCommands.get(commandName)(guildClient, userId, args)
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
  guildClient.logger.info(`Received hotword from ${userId}`)
  Functions.sendMsg(guildClient.textChannel,
    `**${Responses.getResponse('hotword',
      guildClient.members.get(userId).impression,
      [`<@${userId}>`],
      guildClient.settings.impressions)}**`,
    guildClient)

  // Start the expiration timer
  guildClient.logger.info('Starting expiration timer')
  guildClient.lastCalled = Date.now()
  setTimeout(() => { Functions.cleanupGuildClient(guildClient, botClient) }, Config.TIMEOUT + 500)
}

// Settings up more callbacks
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
      Commands.restrictedCommands.get('leave')(guildClient)
    }

    // If the bot has been left alone in a channel, wait a few seconds before leaving
    if (oldPresence.channel.members.size === 1 && userId !== botClient.user.id) {
      guildClient.logger.info('Started alone timeout timer')
      setTimeout(() => {
        // Check again that the channel is empty before leaving
        if (oldPresence.channel.members.size === 1) {
          guildClient.logger.info('Leaving channel, only member remaining')
          Functions.sendMsg(guildClient.textChannel, `${Emojis.sad} I'm leaving, I'm all by myself!`, guildClient)
          Commands.restrictedCommands.get('leave')(guildClient)
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

// Error logging and exit handling
botClient.on('error', error => {
  const promise = new Promise((resolve, reject) => {
    const guilds = Array.from(botClient.guildClients)
    guilds.forEach((guildClient, index, array) => {
      guildClient[1].logger.trace('Sending error message')
      Functions.sendMsg(guildClient[1].textChannel, `${Emojis.error} ***Sorry, I ran into some fatal error. Hopefully I come back soon!***`).then(() => {
        if (index === array.length - 1) resolve()
      })
    })

    if (guilds.length === 0) resolve()
  })

  promise.then(() => Heapdump.writeSnapshot(`./logs/${Date.now()}_CLI.heapdump`, (err, filename) => {
    logger.error(`Client Exception: ${error}`)
    if (err) process.exit(1)
    logger.info(`Heapdump written to ${filename}`)
    process.exit(1)
  }))
})

process.on('uncaughtException', error => {
  Heapdump.writeSnapshot(`./logs/${Date.now()}_ERR.heapdump`, (err, filename) => {
    logger.error(`Uncaught Exception: ${error}`)
    if (err) process.exit(1)
    logger.info(`Heapdump written to ${filename}`)
    process.exit(1)
  })
})

process.on('unhandledRejection', (error, promise) => {
  Heapdump.writeSnapshot(`./logs/${Date.now()}_REJ.heapdump`, (err, filename) => {
    logger.error(`Unhandled Rejection: ${promise}`)
    logger.error(`Reason: ${error}`)
    if (err) process.exit(1)
    logger.info(`Heapdump written to ${filename}`)
    process.exit(1)
  })
})

process.on('SIGTERM', signal => {
  logger.info(`Process ${process.pid} received a SIGTERM signal`)
  process.exit(0)
})

process.on('SIGINT', signal => {
  logger.info(`Process ${process.pid} has been interrupted`)
  const promise = new Promise((resolve, reject) => {
    const guilds = Array.from(botClient.guildClients)
    guilds.forEach((guildClient, index, array) => {
      if (guildClient[1]) guildClient[1].logger.trace('Sending interrupt message')
      Functions.sendMsg(guildClient[1].textChannel, `${Emojis.error} ***Sorry, I'm going down for updates and maintenance! See you soon!***`).then(() => {
        if (index === array.length - 1) resolve()
      })
    })

    if (guilds.length === 0) resolve()
  })

  promise.then(() => {
    process.exit(0)
  })
})

// Switch between testing bot and (future) production bot
if (process.argv.includes('-t') || process.argv.includes('--test')) {
  botClient.login(process.env.TEST_BOT_TOKEN)
} else {
  botClient.login(process.env.SNOWBOY_BOT_TOKEN)
}
