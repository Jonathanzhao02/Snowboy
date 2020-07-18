const Emojis = require('./emojis')
const Streams = require('./streams')
const Ytdl = require('ytdl-core-discord')
const YouTube = require('youtube-node')
const Gsearch = require('./gsearch')
const Settings = require('./settings')
const { Embeds, Responses, Functions } = require('./bot-util')

const youtube = new YouTube()
youtube.setKey(process.env.GOOGLE_API_TOKEN)
Gsearch.setKey(process.env.GOOGLE_API_TOKEN)

var botClient
var keyv

const TIMEOUT = 1800000

// impression values
const HAPPY_VALUE = +2
const GREET_VALUE = +1
const NEVERMIND_VALUE = -1
const SAD_VALUE = -3
const GROSS_VALUE = -5

function setClient (client) {
  botClient = client
}

function setDb (db) {
  keyv = db
}

function connectionHandler (connection, guildClient) {
  guildClient.connection = connection
  connection.play(new Streams.Silence(), { type: 'opus' })
  console.log('Connected!')
}

function queuedPlay (video, guildClient) {
  if (!video) {
    if (guildClient.playing) guildClient.connection.dispatcher.destroy()
    guildClient.connection.dispatcher = undefined
    guildClient.connection.play(new Streams.Silence(), { type: 'opus' })
    guildClient.playing = false
    guildClient.lastCalled = Date.now()
    setTimeout(() => {
      if (Date.now() - guildClient.lastCalled >= TIMEOUT) {
        if (guildClient.textChannel && guildClient.connection && !guildClient.playing) {
          Functions.sendMsg(guildClient.textChannel,
            `${Emojis.happy} **It seems nobody needs me right now, so I'll be headed out. Call me when you do!**`,
            guildClient)
          guildClient.voiceChannel.leave()
        }
        botClient.guildClients.delete(guildClient.guild.id)
      }
    }, TIMEOUT + 500)
    return
  }

  guildClient.guild.members.fetch(video.requester)
    .then(member => {
      Functions.sendMsg(guildClient.textChannel, `${Emojis.playing} **Now Playing:**`, guildClient)
      Functions.sendMsg(guildClient.textChannel, Embeds.createVideoEmbed(video, member.displayName), guildClient)
    })

  /* guildClient.playing = true
  guildClient.connection.play(Ytdl(`http://www.youtube.com/watch?v=${video.id.videoId}`, { quality: 'highestaudio' }), {
    highWaterMark: 50
  })
    .on('finish', () => {
      var queue = guildClient.songQueue
      guildClient.playing = false

      if (guildClient.connection) {
        queue.shift()
        queuedPlay(queue[0], guildClient)
      }
    }) */

  Ytdl(`http://www.youtube.com/watch?v=${video.id.videoId}`).then(stream => {
    guildClient.playing = true
    guildClient.connection.play(stream, {
      type: 'opus',
      highWaterMark: 50
    })
      .on('finish', () => {
        var queue = guildClient.songQueue
        guildClient.playing = false

        if (guildClient.connection) {
          queue.shift()
          queuedPlay(queue[0], guildClient)
        }
      })
  }).catch('error', error => {
    console.log('Youtube error:', error)
    Functions.sendMsg(guildClient.textChannel, `${Emojis.error} ***Sorry, an error occurred on playback!***`, guildClient)
  })
}

function setDeafen (guildClient, userId, bool) {
  const voiceStates = guildClient.textChannel.guild.voiceStates.cache
  const userVoiceState = voiceStates.find(state => state.id === userId)
  if (userVoiceState) userVoiceState.setDeaf(bool)
  Functions.sendMsg(guildClient.textChannel,
    `**${bool ? `${Emojis.mute} Deafened` : `${Emojis.unmute} Undeafened`} <@${userId}>**`,
    guildClient)
}

function play (guildClient, userId, args) {
  if (!guildClient.connection) {
    Functions.sendMsg(guildClient.textChannel, `${Emojis.error} ***I am not in a voice channel!***`, guildClient)
    return
  }

  if (!args || args.length === 0) {
    Functions.sendMsg(guildClient.textChannel, `${Emojis.error} ***I need something to play!***`, guildClient)
    return
  }

  const result = args.join(' ')
  Functions.sendMsg(guildClient.textChannel, `${Emojis.search} ***Searching for*** \`${result}\``, guildClient)

  youtube.search(result, 1, function (error, result) {
    if (error) {
      console.log(error, '\nYOUTUBE ERROR!')
    } else {
      if (!result.items) {
        Functions.sendMsg(guildClient.textChannel, `${Emojis.sad} ***Could not find results for \`${result}\`***`, guildClient)
        return
      }

      result.items[0].requester = userId
      guildClient.songQueue.push(result.items[0])

      if (!guildClient.playing) {
        queuedPlay(result.items[0], guildClient)
      } else {
        guildClient.guild.members.fetch(userId)
          .then(member => {
            Functions.sendMsg(guildClient.textChannel, `${Emojis.queue} **Queued:**`, guildClient)
            Functions.sendMsg(guildClient.textChannel, Embeds.createVideoEmbed(result.items[0], member.displayName), guildClient)
          })
      }
    }
  })
}

function stop (guildClient, userId, args) {
  if (!guildClient.playing) {
    Functions.sendMsg(guildClient.textChannel, `${Emojis.error} ***Nothing currently playing!***`, guildClient)
    return
  }
  guildClient.connection.dispatcher.destroy()
  guildClient.connection.dispatcher = undefined
  guildClient.connection.play(new Streams.Silence(), { type: 'opus' })
  guildClient.playing = false
  guildClient.songQueue = []
  Functions.sendMsg(guildClient.textChannel, `${Emojis.stop} ***Stopped the music***`, guildClient)
}

function skip (guildClient, userId, args) {
  if (!guildClient.playing) {
    Functions.sendMsg(guildClient.textChannel, `${Emojis.error} ***Nothing currently playing!***`, guildClient)
    return
  }
  const songQueue = guildClient.songQueue
  Functions.sendMsg(guildClient.textChannel, `${Emojis.skip} ***Skipping the current song***`, guildClient)
  songQueue.shift()
  queuedPlay(songQueue[0], guildClient)
}

function pause (guildClient, userId, args) {
  if (!guildClient.playing) {
    Functions.sendMsg(guildClient.textChannel, `${Emojis.error} ***Nothing currently playing!***`, guildClient)
    return
  }
  guildClient.connection.dispatcher.pause()
  Functions.sendMsg(guildClient.textChannel, `${Emojis.pause} ***Paused the music***`, guildClient)
}

function resume (guildClient, userId, args) {
  if (!guildClient.playing) {
    Functions.sendMsg(guildClient.textChannel, `${Emojis.error} ***Nothing currently playing!***`, guildClient)
    return
  }
  guildClient.connection.dispatcher.resume()
  Functions.sendMsg(guildClient.textChannel, `${Emojis.playing} **Resuming!**`, guildClient)
}

function leave (guildClient, userId, args) {
  if (!guildClient) return

  if (!guildClient.connection) {
    Functions.sendMsg(guildClient.textChannel, `${Emojis.error} ***I am not connected to a voice channel!***`, guildClient)
    return
  }

  if (userId) {
    Functions.sendMsg(guildClient.textChannel,
      `${Emojis.farewell} **${Responses.farewells[Functions.random(Responses.farewells.length)]},** <@${userId}>!`,
      guildClient)
  }

  guildClient.members.forEach(member => { if (member.snowClient) member.snowClient.stop() })
  guildClient.members.clear()
  if (guildClient.connection) guildClient.connection.removeAllListeners()
  guildClient.voiceChannel.leave()
  guildClient.voiceChannel = undefined
  guildClient.connection = undefined
}

function deafen (guildClient, userId, args) {
  setDeafen(guildClient, userId, true)
}

function undeafen (guildClient, userId, args) {
  setDeafen(guildClient, userId, false)
}

function search (guildClient, userId, args) {
  if (!args || args.length === 0) {
    Functions.sendMsg(guildClient.textChannel, `${Emojis.error} ***I need something to search up!***`, guildClient)
    return
  }

  Functions.sendMsg(guildClient.textChannel, `${Emojis.search} ***Searching*** \`${args.join(' ')}\``, guildClient)

  Gsearch.search(args.join(' '), result => {
    guildClient.guild.members.fetch(userId)
      .then(user => {
        Functions.sendMsg(guildClient.textChannel, Embeds.createSearchEmbed(result, user.username), guildClient)
      })
  })
}

function impression (guildClient, userId, args) {
  Functions.sendMsg(guildClient.textChannel,
    Responses.getResponse('impression', guildClient.members.get(userId).impression, [`<@${userId}>`], guildClient.settings.impressions === 'true'),
    guildClient)
}

function chungus (guildClient, userId, args) {
  Functions.sendMsg(guildClient.textChannel, `${Emojis.rabbit} ***B I G   C H U N G U S*** ${Emojis.rabbit}`, guildClient, {
    files: [`./resources/chungus/chungus${Functions.random(6)}.jpg`]
  })
}

function roll (guildClient, userId, args) {
  Functions.sendMsg(guildClient.textChannel, `${Emojis.dice} **I rolled a \`${Functions.random(6) + 1}\`, <@${userId}>!**`, guildClient)
}

function flip (guildClient, userId, args) {
  const result = Functions.random(2)
  Functions.sendMsg(guildClient.textChannel,
    `${result === 0 ? Emojis.heads : Emojis.tails} **I flipped \`${result === 0 ? 'heads' : 'tails'}\`, <@${userId}>!**`,
    guildClient)
}

/**   VOICE-ONLY COMMANDS   */

function farewell (guildClient, userId, args) {
  const voiceStates = guildClient.textChannel.guild.voiceStates.cache
  const userVoiceState = voiceStates.find(state => state.id === userId)
  if (userVoiceState) userVoiceState.setChannel(null)

  if (guildClient && guildClient.members.get(userId)) {
    guildClient.members.get(userId).snowClient.stop()
    guildClient.members.delete(userId)
  }

  Functions.sendMsg(guildClient.textChannel,
    `${Emojis.farewell} **${Responses.farewells[Functions.random(Responses.farewells.length)]},** <@${userId}>!`,
    guildClient)
}

function greet (guildClient, userId, args) {
  Functions.sendMsg(guildClient.textChannel,
    `${Emojis.greeting} **${Responses.greetings[Functions.random(Responses.greetings.length)]},** <@${userId}>!`,
    guildClient)
  Functions.updateImpression(keyv, guildClient, userId, GREET_VALUE, guildClient.settings.impressions === 'true')
}

function sad (guildClient, userId, args) {
  Functions.sendMsg(guildClient.textChannel, `${Emojis.sad} *Okay...*`, guildClient)
  Functions.updateImpression(keyv, guildClient, userId, SAD_VALUE, guildClient.settings.impressions === 'true')
}

function happy (guildClient, userId, args) {
  Functions.sendMsg(guildClient.textChannel, `${Emojis.happy} **Thank you!**`)
  Functions.updateImpression(keyv, guildClient, userId, HAPPY_VALUE, guildClient.settings.impressions === 'true')
}

function nevermind (guildClient, userId, args) {
  Functions.sendMsg(guildClient.textChannel, `${Emojis.angry} **Call me only when you need me, <@${userId}>!**`, guildClient)
  Functions.updateImpression(keyv, guildClient, userId, NEVERMIND_VALUE, guildClient.settings.impressions === 'true')
}

function gross (guildClient, userId, args) {
  Functions.sendMsg(guildClient.textChannel, `${Emojis.weird} **Not much I can do for you, <@${userId}>**`, guildClient)
  Functions.updateImpression(keyv, guildClient, userId, GROSS_VALUE, guildClient.settings.impressions === 'true')
}

/**   TEXT-ONLY COMMANDS   */

function join (guildClient, userId, args, msg) {
  if (!msg.member.voice.channel) {
    Functions.sendMsg(guildClient.textChannel, `${Emojis.error} ***You are not connected to a voice channel!***`, guildClient)
    return
  } else {
    guildClient.voiceChannel = msg.member.voice.channel
  }

  if (guildClient.connection) {
    Functions.sendMsg(guildClient.textChannel, `${Emojis.error} ***I'm already connected to a voice channel!***`, guildClient)
    return
  }

  Functions.sendMsg(guildClient.textChannel,
    `${Emojis.greeting} **${Responses.greetings[Functions.random(Responses.greetings.length)]},** <@${userId}>!`,
    guildClient)

  guildClient.voiceChannel.join().then(connection => connectionHandler(connection, guildClient)).catch(e => {
    Functions.sendMsg(guildClient.textChannel, `${Emojis.error} ***Could not connect! \\;(***`, guildClient)
    console.log(e)
  })
}

function ping (guildClient, userId, args, msg) {
  const latency = Date.now() - msg.createdAt.getTime()
  Functions.sendMsg(guildClient.textChannel, `Current ping: \`${latency}ms\``, guildClient)
}

function purge (guildClient, userId, args, msg, total, snowflake) {
  if (!total) total = 0
  if (!snowflake) snowflake = undefined
  let filter = m => m.author.id === botClient.user.id
  let mmbr

  if (args[0]) {
    switch (args[0]) {
      case 'true':
        filter = m => m.author.id === botClient.user.id || m.content.startsWith(guildClient.settings.prefix)
        break
      case 't':
        filter = m => m.author.id === botClient.user.id || m.content.startsWith(guildClient.settings.prefix)
        break
      case 'all':
        filter = m => true
        break
      case 'a':
        filter = m => true
        break
      case 'me':
        mmbr = msg.member
        filter = m => m.author.id === msg.author.id
        break
      default:
        mmbr = Functions.findMember(args[0], guildClient.guild)
        if (!mmbr) {
          Functions.sendMsg(guildClient.textChannel, `${Emojis.error} ***Could not find user \`${args[0]}\`***`, guildClient)
          return
        } else {
          filter = m => m.author.id === mmbr.id
        }
        break
    }
  }

  guildClient.purging = true
  guildClient.textChannel.messages.fetch({ limit: 100, before: snowflake }).then(messages => {
    guildClient.textChannel.bulkDelete(messages.filter(filter)).then(deletedMessages => {
      total += deletedMessages.size

      if (deletedMessages.size > 0) {
        console.log('recurring', total)
        purge(guildClient, userId, args, msg, total, deletedMessages.last().id)
      } else {
        console.log('finished', total)
        guildClient.purging = false
        Functions.sendMsg(guildClient.textChannel,
          `${Emojis.trash} **Deleted \`${total}\` messages ${mmbr ? `from user \`${mmbr.displayName}\`` : ''}!**`,
          guildClient)
      }
    })
  })
}

function stats (guildClient, userId, args, msg) {
  Functions.sendMsg(guildClient.textChannel, `**I am currently in \`${botClient.guilds.cache.size}\` servers!**`, guildClient)
}

function about (guildClient, userId, args, msg) {
  Functions.sendMsg(guildClient.textChannel, Embeds.createAboutEmbed(botClient), guildClient)
}

function settings (guildClient, userId, args, msg) {
  if (args.length === 0) {
    Functions.sendMsg(guildClient.textChannel, Embeds.createSettingsEmbed(guildClient.settings), guildClient)
    return
  }
  const settingName = args.shift().toLowerCase()
  if (!Settings.descriptions[settingName]) {
    Functions.sendMsg(guildClient.textChannel, `${Emojis.error} ***Could not find description for \`${settingName}\`***`)
    return
  }
  if (args.length === 0) {
    Functions.sendMsg(guildClient.textChannel, Settings.descriptions[settingName](guildClient.settings), guildClient)
    return
  }
  const val = args.join()
  Functions.sendMsg(guildClient.textChannel, guildClient.settings.set(keyv, settingName, val), guildClient)
}

/**   DEBUG COMMANDS   */

function rawImpression (guildClient, userId, args) {
  let member = guildClient.members.get(userId).member

  if (args[0]) {
    const mmbr = Functions.findMember(args[0], guildClient.guild)
    if (!mmbr) {
      Functions.sendMsg(guildClient.textChannel, `${Emojis.error} ***Could not find user \`${args[0]}\`***`, guildClient)
      return
    }
    member = mmbr
    if (!guildClient.members.get(member.id)) {
      Functions.sendMsg(guildClient.textChannel, `${Emojis.error} ***Could not find data for user \`${args[0]}\`***`, guildClient)
      return
    }
  }

  Functions.sendMsg(guildClient.textChannel,
    `Raw impression of ${member.displayName}: \`${guildClient.members.get(member.id).impression}\``,
    guildClient)
}

function rawImpressions (guildClient, userId, args) {
  const response = ['Raw impressions:']
  guildClient.members.forEach(mmbr => {
    response.push(`    **${mmbr.member.displayName}**: \`${mmbr.impression}\``)
  })
  Functions.sendMsg(guildClient.textChannel, response.join('\n'), guildClient)
}

function setImpression (guildClient, userId, args) {
  var val = args[0]
  var id = userId
  if (args.length === 0 || args.length >= 3) return
  if (args.length === 2) {
    const mmbr = Functions.findMember(args[0], guildClient.guild)
    if (!mmbr) {
      Functions.sendMsg(guildClient.textChannel, `${Emojis.error} ***Could not find user \`${args[0]}\`***`, guildClient)
      return
    }
    id = mmbr.id
    val = args[1]
  }
  const member = guildClient.members.get(id)
  if (!member) return
  member.impression = val
  keyv.set(`${guildClient.guild.id}:${id}:impression`, val)
  Functions.sendMsg(guildClient.textChannel, `Set impression of \`${member.member.displayName}\` to \`${val}\``, guildClient)
}

function clearImpressions (guildClient, userId, args) {
  botClient.guildClients.forEach(gc => gc.members.forEach(usr => {
    usr.impression = 0
    keyv.delete(`${guildClient.guild.id}:${usr.id}:impression`)
  }))
  Functions.sendMsg(guildClient.textChannel, 'Cleared all impressions', guildClient)
}

function printGuild (guildClient, userId, args) {
  console.log(guildClient)
}

function printMembers (guildClient, userId, args) {
  console.log(guildClient.members)
}

function clearDb (guildClient, userId, args) {
  keyv.clear()
  Functions.sendMsg(guildClient.textChannel, 'Cleared Database', guildClient)
  Functions.sendMsg(guildClient.textChannel, 'Shutting down Snowboy, restart for changes to take effect', guildClient)
  process.exit(0)
}

// Commands
const commandMap = new Map()
commandMap.set('deafen', deafen)
commandMap.set('undeafen', undeafen)
commandMap.set('mute', deafen)
commandMap.set('unmute', undeafen)
commandMap.set('search', search)
commandMap.set('roll', roll)
commandMap.set('flip', flip)
commandMap.set('impression', impression)
commandMap.set('about', about)
commandMap.set('chungus', chungus)

// Only available to channels connected to Snowboy when it is in a voice channel
const restrictedCommandMap = new Map()
restrictedCommandMap.set('play', play)
restrictedCommandMap.set('stop', stop)
restrictedCommandMap.set('skip', skip)
restrictedCommandMap.set('pause', pause)
restrictedCommandMap.set('resume', resume)
restrictedCommandMap.set('leave', leave)

// Voice-only commands
const voiceCommandMap = new Map()
voiceCommandMap.set('greeting', greet)
voiceCommandMap.set('farewell', farewell)
voiceCommandMap.set('insult', sad)
voiceCommandMap.set('compliment', happy)
voiceCommandMap.set('nevermind', nevermind)
voiceCommandMap.set('gross', gross)

// Text-only commands
const textCommandMap = new Map()
textCommandMap.set('join', join)
textCommandMap.set('ping', ping)
textCommandMap.set('purge', purge)
textCommandMap.set('stats', stats)
textCommandMap.set('settings', settings)

// Debug commands
const debugCommandMap = new Map()
debugCommandMap.set('rawimpression', rawImpression)
debugCommandMap.set('setimpression', setImpression)
debugCommandMap.set('clearimpressions', clearImpressions)
debugCommandMap.set('rawimpressions', rawImpressions)
debugCommandMap.set('printguild', printGuild)
debugCommandMap.set('printMembers', printMembers)
debugCommandMap.set('cleardb', clearDb)

module.exports = {
  commands: commandMap,
  restrictedCommands: restrictedCommandMap,
  voiceOnlyCommands: voiceCommandMap,
  textOnlyCommands: textCommandMap,
  debugCommands: debugCommandMap,
  setClient: setClient,
  setDb: setDb
}
