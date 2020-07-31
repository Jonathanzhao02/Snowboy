const Discord = require('discord.js')
const Resampler = require('node-libsamplerate')
const Fs = require('fs')
const SnowClient = require('./snowClient')
const Streams = require('./streams')
const Commands = require('./commands')
const GuildSettings = require('./guildSettings')
const UserSettings = require('./userSettings')
const { Emojis, Timeouts, DEBUG_IDS, CONFIDENCE_THRESHOLD } = require('./config')
const { Functions, Impressions, Guilds } = require('./bot-util')
const { botClient, logger, gKeyv, uKeyv } = require('./common')
const Admin = require('./snowboyWebAdmin')
Admin.start()

// Logging
const Heapdump = require('heapdump')

/**
 * Creates a userClient object and updates the userClients map.
 *
 * @param {Discord.User} user The User the userClient is associated with.
 * @returns {Object} Returns the created userClient.
 */
async function createUserClient (user) {
  logger.info(`Creating user construct for ${user.username}`)
  const userConstruct = {
    id: user.id, // the id of the user
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

/**
 * Creates a guildClient object and updates the guildClients map.
 *
 * @param {Discord.Guild} guild The Guild the guildClient is associated with.
 * @returns {Object} Returns the created guildClient.
 */
async function createGuildClient (guild) {
  logger.info(`Creating new guild construct for ${guild.name}`)
  const guildConstruct = {
    id: guild.id, // the id of the guild
    textChannel: null, // text channel to listen to for commands
    voiceChannel: null, // voice channel bot is interested in
    connection: null, // connection to the voice channel
    songQueue: [], // song queue
    loopState: 0, // 0 = no loop, 1 = song loop, 2 = queue loop
    memberClients: new Map(), // information about guildmembers including id, snowclients, guildmember, and impression with snowboy
    playing: false, // whether a song is currently playing
    downloading: false, // whether a song is currently being downloaded
    guild: guild, // the corresponding guild
    lastCalled: Date.now() - 2000, // when the last command was executed
    delete: false, // set to true to mark guild for deletion upon disconnect
    purging: false, // whether the purging command is currently active
    settings: await GuildSettings.load(gKeyv, guild.id), // custom settings for the current guild
    timeoutId: null, // the id of the current timeout interval function
    logger: logger.child({ guild: guild.id, name: guild.name }) // pino logger
  }

  guildConstruct.logger.debug(`Read settings as ${guildConstruct.settings}`)
  if (!guildConstruct.settings) guildConstruct.settings = new GuildSettings(guild.id)
  guildConstruct.logger.debug(guildConstruct)
  botClient.guildClients.set(guild.id, guildConstruct)
  return guildConstruct
}

/**
 * Creates a memberClient object and updates the guildClient's member map.
 *
 * @param {Discord.GuildMember} member The GuildMember this memberClient is referring to.
 * @param {Object} guildClient The guildClient this memberClient is assigned to.
 * @return {Object} Returns the created memberClient.
 */
function createMemberClient (member, guildClient) {
  guildClient.logger.info(`Creating new member construct for ${member.displayName}`)
  const memberConstruct = {
    id: member.id, // the id of the member associated with this memberClient
    snowClient: null, // the SnowClient listening to the member of this memberClient
    member: member, // the GuildMember object of the member associated with this memberClient
    userClient: botClient.userClients.get(member.id), // the userClient associated with this member
    guildClient: guildClient, // the guildClient associated with this member
    logger: guildClient.logger.child({ userId: member.id }) // the logger to be used for this memberClient
  }

  guildClient.logger.debug(memberConstruct)
  guildClient.memberClients.set(member.id, memberConstruct)
  return memberConstruct
}

/**
 * Creates or fetches existing clients for a GuildMember/User object.
 *
 * Only returns the UserClient if object is a User.
 * Otherwise, returns the userClient, guildClient, and memberClient.
 *
 * @param {Discord.GuildMember | Discord.User} member The member to fetch all information from.
 * @returns {Object} Returns an Object containing all three clients.
 */
async function createClientsFromMember (member) {
  logger.info(`Fetching clients for ${member}`)
  // Create a new userConstruct if the User is not currently tracked, loading settings from database
  let userClient = botClient.userClients.get(member.id)
  if (!userClient) userClient = await createUserClient(member.user ? member.user : member)

  // If member is a User (no Guild associated), only return the userClient
  if (!member.guild) return { userClient: userClient }

  // Create a new guildConstruct if the Guild is not currently tracked, loading settings from database
  let guildClient = botClient.guildClients.get(member.guild.id)
  if (!guildClient) guildClient = await createGuildClient(member.guild)

  // Create a new memberConstruct if the GuildMember is not currently tracked, loading settings from database
  let memberClient = guildClient.memberClients.get(userClient.id)
  if (!memberClient) memberClient = createMemberClient(member, guildClient)

  return {
    userClient: userClient,
    guildClient: guildClient,
    memberClient: memberClient
  }
}

/**
 * Creates a processed audio stream listening to a GuildMember.
 *
 * Returned stream is formatted 16kHz, mono, 16-bit, little-endian, signed integers.
 * @param {Discord.GuildMember} member The GuildMember to listen to.
 * @param {Discord.VoiceReceiver} receiver The receiver to create the connection from.
 * @returns {ReadableStream} Returns a stream to read audio data from.
 */
function createAudioStream (member, receiver) {
  logger.debug(`Attemting to create audio stream for ${member.displayName} in ${member.guild.id}`)
  const audioStream = receiver.createStream(member, {
    mode: 'pcm',
    end: 'manual'
  })
  // Turns from stereo to mono
  const transformStream = new Streams.TransformStream()
  // Turns from 48k to 16k
  const resample = new Resampler({
    type: 3,
    channels: 1,
    fromRate: 48000,
    fromDepth: 16,
    toRate: 16000,
    toDepth: 16
  })

  // Ensures proper stream cleanup
  resample.on('close', () => {
    transformStream.removeAllListeners()
    audioStream.removeAllListeners()
    resample.removeAllListeners()
    transformStream.destroy()
    audioStream.destroy()
    resample.destroy()
  })
  return audioStream.pipe(transformStream).pipe(resample)
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
  const { userClient, guildClient, memberClient } = await createClientsFromMember(member)
  if (!guildClient || member.voice.channelID !== guildClient.voiceChannel.id || !guildClient.settings.voice) return
  const childLogger = guildClient.logger

  // If the member is not being listened to, create a new SnowClient and process the audio
  // through all necessary streams
  if (!memberClient.snowClient) {
    childLogger.info(`Creating SnowClient for ${member.displayName}`)
    const newClient = new SnowClient(memberClient, userClient.settings.sensitivity)
    newClient.setLogger(memberClient.logger)
    newClient.on('hotword', ack)
    newClient.on('result', parse)
    newClient.on('busy', (memberClient) => Functions.sendMsg(
      memberClient.guildClient.textChannel,
      `***I'm still working on your last request, <@${memberClient.id}>!***`,
      memberClient.guildClient.settings.mentions
    ))
    newClient.on('error', msg => {
      Functions.sendMsg(
        guildClient.textChannel,
        `${Emojis.error} ***Error:*** \`${msg}\``
      )
    })
    newClient.start(createAudioStream(member, guildClient.connection.receiver))
    memberClient.snowClient = newClient
    childLogger.info(`Successfully created SnowClient for ${member.displayName}`)
  }
}

/**
 * Logs a bug report from Snowboy's personal DMs.
 *
 * @param {Discord.Message} msg The sent message.
 * @param {Object} userClient The userClient associated with the User who sent the message.
 */
function logBug (msg, userClient) {
  const logger = userClient.logger
  logger.info(`Received message in DM: ${msg}`)
  if (Date.now() - userClient.lastReport < 86400000) {
    logger.info(`Rejected bug report from ${msg.author.username}`)
    Functions.sendMsg(
      msg.channel, '**Please only send a bug report every 24 hours!**'
    )
  } else {
    logger.info(`Accepting bug report from ${msg.author.username}`)
    userClient.lastReport = Date.now()
    logger.info(`Read bug report from ${msg.author.username}`)
    const file = Fs.createWriteStream(`./bug_reports/bug_report_${msg.createdAt.toISOString()}_${msg.createdAt.getTime()}.txt`)
    file.write(msg.content)
    file.write('\n')
    file.write(`${msg.author.username}#${msg.author.discriminator}`)
    file.close()
    Functions.sendMsg(
      msg.channel,
      '***Logged.*** Thank you for your submission!'
    )
  }
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
  const { userClient, guildClient, memberClient } = await createClientsFromMember(msg.member ? msg.member : msg.author)

  // If it is in Snowboy's DMs, log a new bug report and start the 24 hour cooldown.
  if (!guildClient) {
    logBug(msg, userClient)
    return
  }

  // If the message is not a command for Snowboy, return
  if (!msg.content.startsWith(guildClient.settings.prefix)) return

  // If there is no TextChannel associated with the guildClient, associate the current one
  if (!guildClient.textChannel || !guildClient.connection) guildClient.textChannel = msg.channel

  // Check that Snowboy has all necessary permissions in text channel
  const missingPermissions = Guilds.checkTextPermissions(guildClient.textChannel)
  if (missingPermissions) {
    Functions.sendMsg(
      msg.channel,
      `${Emojis.error} ***Please ensure I have all the following permissions in your text channel! I won't completely work otherwise!***`
    )
    Functions.sendMsg(
      msg.channel,
      Functions.formatList(missingPermissions)
    )
    return
  }

  // Parse out command name and arguments
  const args = msg.content.slice(guildClient.settings.prefix.length).trim().split(/ +/)
  const commandName = args.shift().toLowerCase()

  guildClient.logger.info(`Received ${msg.content}`)
  guildClient.logger.debug(`Understood command as ${commandName} and arguments as ${args}`)

  // If the Guild is sending commands too fast, notify and return
  if (msg.createdAt.getTime() - guildClient.lastCalled < 1000) {
    guildClient.logger.info('Rejecting message, too fast')
    Functions.sendMsg(
      guildClient.textChannel,
      `${Emojis.error} ***Please only send one command a second!***`
    )
    return
  }

  // If Snowboy is currently connected in the guild, and the GuildMember tries to run a restricted command (affects Snowboy's behavior
  // in the voice channel) in another text channel, notify the GuildMember and return
  if (msg.channel.id !== guildClient.textChannel.id && guildClient.connection && Commands.restrictedCommands.get(commandName)) {
    Functions.sendMsg(
      msg.channel,
      `${Emojis.error} ***Sorry, I am not actively listening to this channel!***`
    )
    return
  // If Snowboy is currently connected in the guild, and the GuildMember tries to run a restricted command without being in the active
  // voice channel, notify the GuildMember and return
  } else if (guildClient.connection && msg.member.voice.channelID !== guildClient.voiceChannel.id && Commands.restrictedCommands.get(commandName)) {
    Functions.sendMsg(
      msg.channel,
      `${Emojis.error} ***Sorry, you are not in my voice channel!***`
    )
    return
  }

  // Check all relevant command maps for the current command name, and execute it
  if (Commands.biCommands.get(commandName)) {
    Commands.biCommands.get(commandName).execute(memberClient, args)
  } else if (Commands.restrictedCommands.get(commandName)) {
    Commands.restrictedCommands.get(commandName).execute(memberClient, args)
  } else if (Commands.textOnlyCommands.get(commandName)) {
    Commands.textOnlyCommands.get(commandName).execute(memberClient, args, msg)
  } else if (DEBUG_IDS.includes(memberClient.id) && Commands.debugCommands.get(commandName)) {
    Commands.debugCommands.get(commandName).execute(memberClient, args, msg)
  } else if (Commands.eastereggCommands.get(commandName)) {
    Commands.eastereggCommands.get(commandName).execute(memberClient, args)
  } else {
    Functions.sendMsg(
      msg.channel,
      `${Emojis.confused} ***Sorry, I don't understand.***`
    )
  }

  Functions.startTimeout(guildClient)
}

/**
 * Parses the user's voice commands.
 *
 * Matches the intents identified by
 * Wit to available commands.
 *
 * @param {Object} result The JSON object returned by Wit.
 * @param {Object} memberClient The memberClient of the member triggered the hotword.
 */
function parse (result, memberClient) {
  if (!memberClient || !memberClient.guildClient.settings.voice) return
  memberClient.logger.info(`Received results: ${result.text}, ${result.intents}`)

  // Checks that the user's voice has been parsed by Wit.ai
  if (!result || !result.intents || !result.intents[0] || result.intents[0].confidence < CONFIDENCE_THRESHOLD) {
    memberClient.logger.debug('Rejected voice command')
    memberClient.logger.debug(result)
    Functions.sendMsg(
      memberClient.guildClient.textChannel,
      `${Emojis.unknown} ***Sorry, I didn't catch that...***`
    )
    return
  }

  // Parse out the command intents and queries
  const commandName = result.intents[0].name.toLowerCase()
  const args = result.entities['wit$search_query:search_query'][0].body.toLowerCase().split(' ')
  memberClient.logger.debug(`Understood command as ${commandName} and arguments as ${args}`)

  // Checks all relevant command maps
  if (Commands.biCommands.get(commandName)) {
    Commands.biCommands.get(commandName).execute(memberClient, args)
  } else if (Commands.restrictedCommands.get(commandName)) {
    Commands.restrictedCommands.get(commandName).execute(memberClient, args)
  } else if (Commands.voiceOnlyCommands.get(commandName)) {
    Commands.voiceOnlyCommands.get(commandName).execute(memberClient, args)
  } else if (Commands.eastereggCommands.get(commandName)) {
    Commands.eastereggCommands.get(commandName).execute(memberClient, args)
  } else {
    Functions.sendMsg(
      memberClient.guildClient.textChannel,
      `${Emojis.confused} ***Sorry, I don't understand*** "\`${result.text}\`"`
    )
    memberClient.logger.warn(`No command found for ${commandName}!`)
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
 * @param {Object} memberClient The memberClient of the member who triggered the hotword.
 */
function ack (index, hotword, memberClient) {
  if (!memberClient.guildClient.connection) return
  memberClient.logger.info('Received hotword from')
  Functions.sendMsg(
    memberClient.guildClient.textChannel,
    `**${Impressions.getResponse('hotword',
      memberClient.userClient.impression,
      [`<@${memberClient.id}>`],
      memberClient.userClient.settings.impressions)}**`,
    memberClient.guildClient.settings.mentions
  )

  Functions.startTimeout(memberClient.guildClient)
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
    if (guildClient.memberClients.get(userId)) {
      guildClient.logger.info(`Stopping SnowClient for ${newPresence.member.displayName}`)
      const snowClient = guildClient.memberClients.get(userId).snowClient
      if (snowClient) {
        snowClient.stop()
      }
      guildClient.memberClients.get(userId).snowClient = null
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
          Functions.sendMsg(
            guildClient.textChannel,
            `${Emojis.sad} I'm leaving, I'm all by myself!`
          )
          Commands.restrictedCommands.get('leave').execute(guildClient)
        }
      }, Timeouts.ALONE_TIMEOUT + 500)
    }

    // If the bot has disconnected and the guildClient is marked for deletion, delete it
    if (userId === botClient.user.id && !newPresence.channelID && guildClient.delete) {
      guildClient.logger.info('Deleting guild client')
      botClient.guildClients.delete(guildClient.id)
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
  console.log('CLIENT ERROR: Exiting')
  console.log(error)
  const promise = new Promise((resolve, reject) => {
    const guilds = Array.from(botClient.guildClients)
    Functions.forEachAsync(guilds, async (pair, index, array) => {
      if (pair[1]) pair[1].logger.debug('Sending error message')
      await Functions.sendMsg(
        pair[1].textChannel,
        `${Emojis.skull} ***Sorry, I ran into some fatal error. Hopefully I come back soon!***`
      )
      if (index === array.length - 1) resolve()
    })

    if (guilds.length === 0) resolve()
  })

  promise.then(() => Heapdump.writeSnapshot(`./logs/${new Date().toISOString()}_CLI.heapdump`, (err, filename) => {
    logger.error('Client exception')
    logger.error(error)
    if (err) process.exit(1)
    logger.debug(`Heapdump written to ${filename}`)
    botClient.destroy()
    process.exit(1)
  }))
})

// On uncaught exception
process.on('uncaughtException', error => {
  console.log('UNCAUGHT EXCEPTION: Exiting')
  console.log(error)
  Heapdump.writeSnapshot(`./logs/${new Date().toISOString()}_ERR.heapdump`, (err, filename) => {
    logger.error('Uncaught exception')
    logger.error(error)
    botClient.destroy()
    if (err) process.exit(1)
    logger.debug(`Heapdump written to ${filename}`)
    process.exit(1)
  })
})

// On unhandled promise rejection
process.on('unhandledRejection', (error, promise) => {
  console.log('UNHANDLED REJECTION: Exiting')
  console.log(error)
  console.log(promise)
  Heapdump.writeSnapshot(`./logs/${new Date().toISOString()}_REJ.heapdump`, (err, filename) => {
    logger.error('Unhandled promise rejection')
    logger.error(promise)
    logger.error(error)
    botClient.destroy()
    if (err) process.exit(1)
    logger.debug(`Heapdump written to ${filename}`)
    process.exit(1)
  })
})

// On process termination (exits normally)
process.on('SIGTERM', signal => {
  console.log('Received SIGTERM signal')
  logger.info(`Process ${process.pid} received a SIGTERM signal`)
  botClient.destroy()
  process.exit(0)
})

// On process interrupt
process.on('SIGINT', signal => {
  console.log('Received SIGINT signal')
  logger.info(`Process ${process.pid} has been interrupted`)
  const promise = new Promise((resolve, reject) => {
    const guilds = Array.from(botClient.guildClients)
    Functions.forEachAsync(guilds, async (pair, index, array) => {
      if (pair[1]) pair[1].logger.debug('Sending interrupt message')
      await Functions.sendMsg(
        pair[1].textChannel,
        `${Emojis.joyful} ***Sorry, I'm going down for updates and maintenance! See you soon!***`
      )
      if (index === array.length - 1) resolve()
    })

    if (guilds.length === 0) resolve()
  })

  promise.then(() => {
    botClient.destroy()
    process.exit(0)
  })
})

// Switch between testing bot and (future) production bot
if (process.argv.includes('-t') || process.argv.includes('--test')) {
  botClient.login(process.env.TEST_BOT_TOKEN)
} else {
  botClient.login(process.env.SNOWBOY_BOT_TOKEN)
}

/**
 * TODO:
 * Replace all memberClient commands with just member, and take advantage of the Functions.getClientsFromMember command
 * Replace forEach in errors with forEachAsync
 * Also change SnowClient to use member instead of memberClient
 * Change client constructs into actual objects instead of just make-believe objects
 * Refactor leave command into separate general 'leave' in bot-util for leaving guilds and the command itself
 */
