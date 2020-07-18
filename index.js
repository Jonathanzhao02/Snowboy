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

const botClient = new Discord.Client()
botClient.guildClients = new Map() // to keep track of individual active guilds
botClient.userClients = new Map() // to keep track of individual user bug reports
Wit.setKey(process.env.WIT_API_TOKEN)

const keyv = new Keyv('sqlite://db/snowboy.db', { table: 'guilds' })
keyv.on('error', console.error)

Commands.setClient(botClient)
Commands.setDb(keyv)

const TIMEOUT = 1800000
const OWNER_ID = '290237225596092416'

async function onSpeaking (member, speaking) {
  if (!member || speaking.equals(0) || member.id === botClient.user.id) return
  const guildClient = botClient.guildClients.get(member.guild.id)
  if (!guildClient || member.voice.channel !== guildClient.voiceChannel || !guildClient.settings.voice) return
  let mmbr = guildClient.members.get(member.id)
  let newClient = null

  if (!mmbr) {
    const memberConstruct = {
      id: member.id,
      snowClient: newClient,
      member: member,
      impression: await keyv.get(`${member.guild.id}:${member.id}:impression`)
    }

    if (!memberConstruct.impression) memberConstruct.impression = 0
    guildClient.members.set(member.id, memberConstruct)
    mmbr = memberConstruct
  }

  if (!mmbr.snowClient) {
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
    newClient.on('hotword', ack)
    newClient.on('result', parse)
    newClient.on('busy', (guildClient, userId) => Functions.sendMsg(guildClient.textChannel, `***I'm still working on your last request, <@${userId}>!***`, guildClient))
    newClient.on('error', msg => { Functions.sendMsg(guildClient.textChannel, `${Emojis.error} ***Error:*** \`${msg}\``, guildClient) })
    newClient.start(resample)
    mmbr.snowClient = newClient
  }
}

function bugLog (msg) {
  const file = Fs.createWriteStream(`./bug_reports/bug_report_${msg.createdAt.toDateString().replace(' ', '_')}_${msg.createdAt.getTime()}.txt`)
  file.write(msg.content)
  file.write('\n')
  file.write(`${msg.author.username}#${msg.author.discriminator}`)
  file.close()
}

async function onMessage (msg) {
  if (msg.author.bot || msg.system) return
  if (msg.channel instanceof Discord.DMChannel) {
    if (!botClient.userClients.get(msg.author.id)) {
      const userConstruct = {
        lastReport: 0
      }
      botClient.userClients.set(msg.author.id, userConstruct)
    }
    if (Date.now() - botClient.userClients.get(msg.author.id).lastReport < 86400000) {
      Functions.sendMsg(msg.channel, '**Please only send a bug report every 24 hours!**')
    } else {
      botClient.userClients.get(msg.author.id).lastReport = Date.now()
      bugLog(msg)
      Functions.sendMsg(msg.channel, '***Logged.*** **Thank you for your submission!**')
    }
    return
  }

  const guildId = msg.guild.id
  const userId = msg.author.id

  if (!botClient.guildClients.get(msg.guild.id)) {
    console.log('NEW GUILD:\n', guildId)
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
      settings: await Settings.load(keyv, guildId) // custom settings for the current guild
    }

    if (!guildConstruct.settings) guildConstruct.settings = new Settings(guildId)
    botClient.guildClients.set(guildId, guildConstruct)
  }

  const guildClient = botClient.guildClients.get(msg.guild.id)
  const args = msg.content.slice(guildClient.settings.prefix.length).trim().split(/ +/)
  const commandName = args.shift().toLowerCase()

  if (!msg.content.startsWith(guildClient.settings.prefix)) return
  if (!guildClient.textChannel) guildClient.textChannel = msg.channel
  if (msg.channel !== guildClient.textChannel && guildClient.connection && Commands.restrictedCommands.get(commandName)) {
    Functions.sendMsg(msg.channel, `${Emojis.error} ***Sorry, I am not actively listening to this channel!***`, guildClient)
    return
  } else {
    guildClient.textChannel = msg.channel
  }

  if (!guildClient.members.get(userId)) {
    const memberConstruct = {
      id: userId, // the user's discord id
      snowClient: undefined, // the snowclient listening to the member
      member: msg.member, // the guildmember object of the member within the guild
      impression: await keyv.get(`${guildId}:${userId}:impression`) // the member's impression level with snowboy
    }

    if (!memberConstruct.impression) memberConstruct.impression = 0
    guildClient.members.set(userId, memberConstruct)
  }

  console.log(`Received ${msg.content}`)

  if (msg.createdAt.getTime() - guildClient.lastCalled < 1000) {
    Functions.sendMsg(guildClient.textChannel, `${Emojis.error} ***Please only send one command every second!***`, guildClient)
    return
  }

  if (Commands.commands.get(commandName)) {
    Commands.commands.get(commandName)(guildClient, userId, args)
  } else if (Commands.restrictedCommands.get(commandName)) {
    Commands.restrictedCommands.get(commandName)(guildClient, userId, args)
  } else if (Commands.textOnlyCommands.get(commandName)) {
    Commands.textOnlyCommands.get(commandName)(guildClient, userId, args, msg)
  } else if (userId === OWNER_ID && Commands.debugCommands.get(commandName)) {
    Commands.debugCommands.get(commandName)(guildClient, userId, args)
  } else {
    Functions.sendMsg(msg.channel, `${Emojis.confused} ***Sorry, I don't understand.***`, guildClient)
  }

  guildClient.lastCalled = Date.now()
  setTimeout(() => {
    if (Date.now() - guildClient.lastCalled >= TIMEOUT) {
      if (guildClient.textChannel && guildClient.connection && !guildClient.playing) {
        Functions.sendMsg(guildClient.textChannel, `${Emojis.happy} **It seems nobody needs me right now, so I'll be headed out. Call me when you do!**`, guildClient)
        guildClient.delete = true
        guildClient.voiceChannel.leave()
      } else {
        botClient.guildClients.delete(guildClient.guild.id)
      }
    }
  }, TIMEOUT + 500)
}

function parse (result, guildClient, userId) {
  if (!guildClient) return
  console.log(`${result.text}\n`, result.intents)

  if (!result || !result.intents || !result.intents[0] || result.intents[0].confidence < 0.7) {
    Functions.sendMsg(guildClient.textChannel, `${Emojis.unknown} ***Sorry, I didn't catch that...***`, guildClient)
    return
  }

  const commandName = result.intents[0].name.toLowerCase()
  const args = result.entities['wit$search_query:search_query'][0].body.toLowerCase().split(' ')

  if (Commands.commands.get(commandName)) {
    Commands.commands.get(commandName)(guildClient, userId, args)
  } else if (Commands.restrictedCommands.get(commandName)) {
    Commands.restrictedCommands.get(commandName)(guildClient, userId, args)
  } else if (Commands.voiceOnlyCommands.get(commandName)) {
    Commands.voiceOnlyCommands.get(commandName)(guildClient, userId, args)
  } else {
    Functions.sendMsg(guildClient.textChannel, `${Emojis.confused} ***Sorry, I don't understand*** "\`${result.text}\`"`, guildClient)
  }
}

function ack (index, hotword, guildClient, userId) {
  if (!guildClient.connection) return
  console.log('!!!')
  Functions.sendMsg(guildClient.textChannel,
    `**${Responses.getResponse('hotword',
      guildClient.members.get(userId).impression,
      [`<@${userId}>`],
      guildClient.settings.impressions === 'true')}**`,
    guildClient)
  guildClient.lastCalled = Date.now()
  setTimeout(() => {
    if (Date.now() - guildClient.lastCalled >= TIMEOUT) {
      if (guildClient.textChannel && guildClient.connection && !guildClient.playing) {
        Functions.sendMsg(guildClient.textChannel, `${Emojis.happy} **It seems nobody needs me right now, so I'll be headed out. Call me when you do!**`, guildClient)
        guildClient.delete = true
        guildClient.voiceChannel.leave()
      } else {
        botClient.guildClients.delete(guildClient.guild.id)
      }
    }
  }, TIMEOUT + 500)
}

botClient.on('ready', () => {
  console.log(`Logged in as ${botClient.user.tag}`)
})

botClient.on('message', onMessage)
botClient.on('guildMemberSpeaking', onSpeaking)
botClient.on('voiceStateUpdate', (oldPresence, newPresence) => {
  const guildClient = botClient.guildClients.get(newPresence.guild.id)
  const userId = newPresence.id

  if (guildClient && guildClient.voiceChannel && oldPresence.channelID === guildClient.voiceChannel.id &&
    (!newPresence.channelID || newPresence.channelID !== guildClient.voiceChannel.id)) {
    if (guildClient.members.get(userId)) {
      const snowClient = guildClient.members.get(userId).snowClient
      if (snowClient) {
        snowClient.stop()
      }
      guildClient.members.delete(userId)
    }

    if ((userId === botClient.user.id && !newPresence.channelID) || (oldPresence.channel.members.size === 1 && userId !== botClient.user.id)) {
      if (oldPresence.channel.members.size === 1 && userId !== botClient.user.id) {
        Functions.sendMsg(guildClient.textChannel, `${Emojis.sad} I'm leaving, I'm all by myself!`, guildClient)
      }

      console.log('Disconnected!')
      Commands.restrictedCommands.get('leave')(guildClient)
    }

    if (userId === botClient.user.id && guildClient.delete) {
      botClient.guildClients.delete(guildClient.guild.id)
    }
  }
})

if (process.argv.includes('-t') || process.argv.includes('--test')) {
  botClient.login(process.env.TEST_BOT_TOKEN)
} else {
  botClient.login(process.env.SNOWBOY_BOT_TOKEN)
}

botClient.on('guildCreate', guild => {
  console.log('Joined new guild')
  guild.systemChannel.send('**Hi! Thank you for adding me to the server!**\n' +
  ' - My name is Snowboy. Just say my name while I\'m in your channel to call me.\n' +
  ' - My default prefix is `%`, but you can change that using the `settings` command.\n' +
  ' - If you have trouble remembering my commands, just use the `help` command to list them all out.\n' +
  ' - If you find any bugs with me, feel free to shoot me a DM about it. Please keep the report to one message!\n' +
  '**Please note that I\'m still in testing, so I \\*may\\* shut down frequently!**')
})

botClient.on('error', error => {
  botClient.guildClients.forEach(guildClient => {
    Functions.sendMsg(guildClient.textChannel, `${Emojis.error} ***Fatal error, shutting down Snowboy***`, guildClient)
  })
  console.error(error)
})
