const Emojis = require('./emojis')
const Streams = require('./streams')
const Ytdl = require('ytdl-core-discord')
const YouTube = require('youtube-node')
const Gsearch = require('./gsearch')
const Settings = require('./settings')
const Config = require('./config')
const { Embeds, Responses, Functions } = require('./bot-util')

const youtube = new YouTube()
youtube.setKey(process.env.GOOGLE_API_TOKEN)
Gsearch.setKey(process.env.GOOGLE_API_TOKEN)

// Plays silence frames, necessary for 'speaking' event to continue working
const SILENCE = new Streams.Silence()

var botClient
var keyv

/**
 * Sets the bot client used for commands.
 *
 * @param {Discord.Client} client The Client of the bot to be used.
 */
function setClient (client) {
  botClient = client
}

/**
 * Sets the database used for commands.
 *
 * @param {Keyv} db The Keyv database to be used.
 */
function setDb (db) {
  keyv = db
}

/**
 * Handles all setup associated with the connection.
 *
 * @param {Discord.VoiceConnection} connection The VoiceConnection from the VoiceChannel.
 * @param {Object} guildClient The guildClient associated with the server of the connection.
 */
function connectionHandler (connection, guildClient) {
  guildClient.connection = connection
  connection.play(SILENCE, { type: 'opus' })
  console.log('Connected!')
}

/**
 * Queues a song for playback.
 *
 * @param {Object} video The video object returned by the Youtube Data API.
 * @param {Object} guildClient The guildClient associated with the server of the playback.
 */
function queuedPlay (video, guildClient) {
  // If no video, clean up connection and begin expiration timeout
  if (!video) {
    // End current dispatcher
    if (guildClient.playing) guildClient.connection.dispatcher.end()
    guildClient.connection.play(SILENCE, { type: 'opus' })
    guildClient.playing = false
    guildClient.lastCalled = Date.now()
    setTimeout(() => {
      Functions.cleanupGuildClient(guildClient, botClient)
    }, Config.TIMEOUT + 500)
    return
  }

  // Sends a message detailing the currently playing video
  guildClient.guild.members.fetch(video.requester)
    .then(member => {
      Functions.sendMsg(guildClient.textChannel, `${Emojis.playing} **Now Playing:**`, guildClient)
      Functions.sendMsg(guildClient.textChannel, Embeds.createVideoEmbed(video, member.displayName), guildClient)
    })

  // Uses default ytdl-core, not recommended due to ytdl-core-discord having better performance for now
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

  // Uses ytdl-core-discord
  Ytdl(`http://www.youtube.com/watch?v=${video.id.videoId}`).then(stream => {
    guildClient.playing = true
    guildClient.connection.play(stream, {
      type: 'opus',
      highWaterMark: 50
    })
      .on('finish', () => {
        // Goes to next song in queue
        var queue = guildClient.songQueue
        guildClient.playing = false
        stream.destroy()

        if (guildClient.connection) {
          queue.shift()
          queuedPlay(queue[0], guildClient)
        }
      })
  }).catch('error', error => {
    // Uh oh
    console.log('Youtube error:', error)
    Functions.sendMsg(guildClient.textChannel, `${Emojis.error} ***Sorry, an error occurred on playback!***`, guildClient)
  })
}

/**
 * Sets the deafen state of a user.
 *
 * @param {Object} guildClient The guildClient of the user's server.
 * @param {String} userId The ID of the user to be deafened.
 * @param {boolean} bool Whether to deafen or undeafen the user.
 */
function setDeafen (guildClient, userId, bool) {
  const voiceStates = guildClient.textChannel.guild.voiceStates.cache
  const userVoiceState = voiceStates.find(state => state.id === userId)
  if (userVoiceState) userVoiceState.setDeaf(bool)
  Functions.sendMsg(guildClient.textChannel,
    `**${bool ? `${Emojis.mute} Deafened` : `${Emojis.unmute} Undeafened`} <@${userId}>**`,
    guildClient)
}

/**
 * Plays or queues a song.
 *
 * @param {Object} guildClient The guildClient of the user's server.
 * @param {String} userId The ID of the user requesting a song.
 * @param {String[]} args The search query for the song.
 */
function play (guildClient, userId, args) {
  // If not connected, notify and return
  if (!guildClient.connection) {
    Functions.sendMsg(guildClient.textChannel, `${Emojis.error} ***I am not in a voice channel!***`, guildClient)
    return
  }

  // If no query, notify and return
  if (!args || args.length === 0) {
    Functions.sendMsg(guildClient.textChannel, `${Emojis.error} ***I need something to play!***`, guildClient)
    return
  }

  const result = args.join(' ')
  Functions.sendMsg(guildClient.textChannel, `${Emojis.search} ***Searching for*** \`${result}\``, guildClient)

  // Search for the video using the Youtube Data API
  youtube.search(result, 1, function (error, result) {
    if (error) {
      console.log(error, '\nYOUTUBE ERROR!')
    } else {
      if (!result.items) {
        Functions.sendMsg(guildClient.textChannel, `${Emojis.sad} ***Could not find results for \`${result}\`***`, guildClient)
        return
      }

      // Adds a property to track who requested the song
      result.items[0].requester = userId
      guildClient.songQueue.push(result.items[0])

      // If not playing anything, play this song
      if (!guildClient.playing) {
        queuedPlay(result.items[0], guildClient)
      // If playing something, just say it's queued
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

/**
 * Stops all song playback and clears the queue.
 *
 * @param {Object} guildClient The guildClient of the server with song playback.
 * @param {String} userId Unused parameter.
 * @param {String[]} args Unused parameter.
 */
function stop (guildClient, userId, args) {
  if (!guildClient.playing) {
    Functions.sendMsg(guildClient.textChannel, `${Emojis.error} ***Nothing currently playing!***`, guildClient)
    return
  }
  guildClient.connection.dispatcher.end()
  guildClient.connection.play(SILENCE, { type: 'opus' })
  guildClient.playing = false
  guildClient.songQueue = []
  Functions.sendMsg(guildClient.textChannel, `${Emojis.stop} ***Stopped the music***`, guildClient)
}

/**
 * Skips to the next song in queue by ending the current dispatcher.
 *
 * @param {Object} guildClient The guildClient of the server with song playback.
 * @param {String} userId Unused parameter.
 * @param {String[]} args Unused parameter.
 */
function skip (guildClient, userId, args) {
  if (!guildClient.playing) {
    Functions.sendMsg(guildClient.textChannel, `${Emojis.error} ***Nothing currently playing!***`, guildClient)
    return
  }
  Functions.sendMsg(guildClient.textChannel, `${Emojis.skip} ***Skipping the current song***`, guildClient)
  guildClient.connection.dispatcher.end()
}

/**
 * Pauses the current song.
 *
 * @param {Object} guildClient The guildClient of the server with song playback.
 * @param {String} userId Unused parameter.
 * @param {String[]} args Unused parameter.
 */
function pause (guildClient, userId, args) {
  if (!guildClient.playing) {
    Functions.sendMsg(guildClient.textChannel, `${Emojis.error} ***Nothing currently playing!***`, guildClient)
    return
  }
  guildClient.connection.dispatcher.pause()
  Functions.sendMsg(guildClient.textChannel, `${Emojis.pause} ***Paused the music***`, guildClient)
}

/**
 * Resumes the current song.
 *
 * @param {Object} guildClient The guildClient of the server with song playback.
 * @param {String} userId Unused parameter.
 * @param {String[]} args Unused parameter.
 */
function resume (guildClient, userId, args) {
  if (!guildClient.playing) {
    Functions.sendMsg(guildClient.textChannel, `${Emojis.error} ***Nothing currently playing!***`, guildClient)
    return
  }
  guildClient.connection.dispatcher.resume()
  Functions.sendMsg(guildClient.textChannel, `${Emojis.playing} **Resuming!**`, guildClient)
}

/**
 * Leaves the VoiceChannel.
 *
 * @param {Object} guildClient The guildClient of the server.
 * @param {String?} userId The ID of the user who requested Snowboy to leave.
 * @param {String[]} args Unused parameter.
 */
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
  if (guildClient.connection) {
    guildClient.connection.removeAllListeners()
    guildClient.connection.disconnect()
    if (guildClient.connection.dispatcher) guildClient.connection.dispatcher.end()
  }
  guildClient.voiceChannel.leave()
  guildClient.voiceChannel = undefined
  guildClient.connection = undefined
}

/**
 * Deafens a user.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {String} userId The ID of the user who requested to deafen.
 * @param {String[]} args Unused parameter.
 */
function deafen (guildClient, userId, args) {
  setDeafen(guildClient, userId, true)
}

/**
 * Undeafens a user.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {String} userId The ID of the user who requested to undeafen.
 * @param {String[]} args Unused parameter.
 */
function undeafen (guildClient, userId, args) {
  setDeafen(guildClient, userId, false)
}

/**
 * Searches up and prints the top result of a search query.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {String} userId The ID of the user who requested the search.
 * @param {String[]} args The search query.
 */
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

/**
 * Prints Snowboy's impression of a user.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {String} userId The ID of the user who requested the command.
 * @param {String[]} args Unused parameter.
 */
function impression (guildClient, userId, args) {
  Functions.sendMsg(guildClient.textChannel,
    Responses.getResponse('impression', guildClient.members.get(userId).impression, [`<@${userId}>`], guildClient.settings.impressions),
    guildClient)
}

/**
 * No description needed.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {String} userId Unused parameter
 * @param {String[]} args Unused parameter
 */
function chungus (guildClient, userId, args) {
  Functions.sendMsg(guildClient.textChannel, `${Emojis.rabbit} ***B I G   C H U N G U S*** ${Emojis.rabbit}`, guildClient, {
    files: [`./resources/chungus/chungus${Functions.random(6)}.jpg`]
  })
}

/**
 * Rolls a six-sided die.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {String} userId The ID of the user who requested the command.
 * @param {String[]} args Unused parameter.
 */
function roll (guildClient, userId, args) {
  Functions.sendMsg(guildClient.textChannel, `${Emojis.dice} **I rolled a \`${Functions.random(6) + 1}\`, <@${userId}>!**`, guildClient)
}

/**
 * Flips a two-sided coin.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {String} userId The ID of the user who requested the command.
 * @param {String[]} args Unused parameter.
 */
function flip (guildClient, userId, args) {
  const result = Functions.random(2)
  Functions.sendMsg(guildClient.textChannel,
    `${result === 0 ? Emojis.heads : Emojis.tails} **I flipped \`${result === 0 ? 'heads' : 'tails'}\`, <@${userId}>!**`,
    guildClient)
}

/**   VOICE-ONLY COMMANDS   */

/**
 * Disconnects and says goodbye to a user.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {String} userId The ID of the user who requested the command.
 * @param {String[]} args Unused parameter.
 */
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

/**
 * Greets a user.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {String} userId The ID of the user who requested the command.
 * @param {String[]} args Unused parameter.
 */
function greet (guildClient, userId, args) {
  Functions.sendMsg(guildClient.textChannel,
    `${Emojis.greeting} **${Responses.greetings[Functions.random(Responses.greetings.length)]},** <@${userId}>!`,
    guildClient)
  Functions.updateImpression(keyv, guildClient, userId, Config.ImpressionValues.GREET_VALUE, guildClient.settings.impressions)
}

/**
 * Makes Snowboy sad.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {String} userId The ID of the user who requested the command.
 * @param {String[]} args Unused parameter.
 */
function sad (guildClient, userId, args) {
  Functions.sendMsg(guildClient.textChannel, `${Emojis.sad} *Okay...*`, guildClient)
  Functions.updateImpression(keyv, guildClient, userId, Config.ImpressionValues.SAD_VALUE, guildClient.settings.impressions)
}

/**
 * Makes Snowboy happy.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {String} userId The ID of the user who requested the command.
 * @param {String[]} args Unused parameter.
 */
function happy (guildClient, userId, args) {
  Functions.sendMsg(guildClient.textChannel, `${Emojis.happy} **Thank you!**`)
  Functions.updateImpression(keyv, guildClient, userId, Config.ImpressionValues.HAPPY_VALUE, guildClient.settings.impressions)
}

/**
 * Makes Snowboy mildy irritated that someone called it just to say nevermind.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {String} userId The ID of the user who requested the command.
 * @param {String[]} args Unused parameter.
 */
function nevermind (guildClient, userId, args) {
  Functions.sendMsg(guildClient.textChannel, `${Emojis.angry} **Call me only when you need me, <@${userId}>!**`, guildClient)
  Functions.updateImpression(keyv, guildClient, userId, Config.ImpressionValues.NEVERMIND_VALUE, guildClient.settings.impressions)
}

/**
 * Makes Snowboy grossed out.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {String} userId The ID of the user who requested the command.
 * @param {String[]} args Unused parameter.
 */
function gross (guildClient, userId, args) {
  Functions.sendMsg(guildClient.textChannel, `${Emojis.weird} **Not much I can do for you, <@${userId}>**`, guildClient)
  Functions.updateImpression(keyv, guildClient, userId, Config.ImpressionValues.GROSS_VALUE, guildClient.settings.impressions)
}

/**   TEXT-ONLY COMMANDS   */

/**
 * Makes Snowboy join a VoiceChannel.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {String} userId The ID of the user who requested the command.
 * @param {String[]} args Unused parameter.
 * @param {Discord.Message} msg The Message the user sent.
 */
function join (guildClient, userId, args, msg) {
  // If the user is not connected to a VoiceChannel, notify and return
  if (!msg.member.voice.channel) {
    Functions.sendMsg(guildClient.textChannel, `${Emojis.error} ***You are not connected to a voice channel!***`, guildClient)
    return
  // Otherwise, set the guildClient VoiceChannel to the member's
  } else {
    guildClient.voiceChannel = msg.member.voice.channel
  }

  // If already connected, notify and return
  if (guildClient.connection) {
    Functions.sendMsg(guildClient.textChannel, `${Emojis.error} ***I'm already connected to a voice channel!***`, guildClient)
    return
  }

  // Greet the user
  Functions.sendMsg(guildClient.textChannel,
    `${Emojis.greeting} **${Responses.greetings[Functions.random(Responses.greetings.length)]},** <@${userId}>!`,
    guildClient)

  // Attempt to join and handle the connection, or error
  guildClient.voiceChannel.join().then(connection => connectionHandler(connection, guildClient)).catch(e => {
    Functions.sendMsg(guildClient.textChannel, `${Emojis.error} ***Could not connect! \\;(***`, guildClient)
    console.log(e)
  })
}

/**
 * Prints the ping of the bot to the server.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {String} userId Unused parameter.
 * @param {String[]} args Unused parameter.
 * @param {Discord.Message} msg The Message the user sent.
 */
function ping (guildClient, userId, args, msg) {
  const latency = Date.now() - msg.createdAt.getTime()
  Functions.sendMsg(guildClient.textChannel, `Current ping: \`${latency}ms\``, guildClient)
}

/**
 * Bulk deletes messages in a TextChannel with a variety of options.
 *
 * Due to API limitations, the bot can only delete up to
 * 100 messages between recursions, otherwise it will return.
 * Moreover, it can only delete messages up to 2 weeks old.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {String} userId The ID of the user who requested the command.
 * @param {String[]} args Any options sent with the command.
 * @param {Discord.Message} msg The Message the user sent.
 * @param {Number?} total The total number of messages deleted. Passed recursively.
 * @param {String?} snowflake The ID of the latest deleted message. Passed recursively.
 */
function purge (guildClient, userId, args, msg, total, snowflake) {
  // On the first recursion, return if the purging command is already active
  if (guildClient.purging && !total) return
  if (!total) total = 0
  let filter = m => m.author.id === botClient.user.id
  let mmbr

  if (args[0]) {
    switch (args[0]) {
      // Include commands in the deletion
      case 'true':
        filter = m => m.author.id === botClient.user.id || m.content.startsWith(guildClient.settings.prefix)
        break
      case 't':
        filter = m => m.author.id === botClient.user.id || m.content.startsWith(guildClient.settings.prefix)
        break
      // Delete all messages (SHOULD BE ADMIN ONLY)
      case 'all':
        filter = m => true
        break
      case 'a':
        filter = m => true
        break
      // Delete the requester's messages
      case 'me':
        mmbr = msg.member
        filter = m => m.author.id === msg.author.id
        break
      // Delete the messages of the mentioned user
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

  // Flag that the purge command is already active
  guildClient.purging = true

  // Fetch 100 messages before the snowflake
  guildClient.textChannel.messages.fetch({ limit: 100, before: snowflake }).then(messages => {
    // Bulk delete all fetched messages that pass through the filter
    guildClient.textChannel.bulkDelete(messages.filter(filter)).then(deletedMessages => {
      total += deletedMessages.size

      // If deleted messages, continue deleting recursively
      if (deletedMessages.size > 0) {
        console.log('recurring', total)
        purge(guildClient, userId, args, msg, total, deletedMessages.last().id)
      // If no messages deleted, purge command has finished all it can, return
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

/**
 * Prints the stats of Snowboy.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {String} userId Unused parameter.
 * @param {String[]} args Unused parameter.
 * @param {Discord.Message} msg Unused parameter.
 */
function stats (guildClient, userId, args, msg) {
  Functions.sendMsg(guildClient.textChannel, `**I am currently in \`${botClient.guilds.cache.size}\` servers!**`, guildClient)
}

/**
 * Prints the about embed of Snowboy.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {String} userId Unused parameter.
 * @param {String[]} args Unused parameter.
 * @param {Discord.Message} msg Unused parameter.
 */
function about (guildClient, userId, args, msg) {
  Functions.sendMsg(guildClient.textChannel, Embeds.createAboutEmbed(botClient), guildClient)
}

/**
 * Prints or modifies the settings of a guildClient.
 *
 * Depending on the passed arguments, can either print information
 * about the settings, about a certain option, or modify an option.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {String} userId Unused parameter.
 * @param {String[]} args The arguments passed with the command.
 * @param {Discord.Message} msg Unused parameter.
 */
function settings (guildClient, userId, args, msg) {
  // SHOULD BE MADE ADMIN ONLY
  // If no arguments, print the settings embed with all values
  if (args.length === 0) {
    Functions.sendMsg(guildClient.textChannel, Embeds.createSettingsEmbed(guildClient.settings), guildClient)
    return
  }
  const settingName = args.shift().toLowerCase()
  // If no option named what the user passed in, notify and return
  if (!Settings.descriptions[settingName]) {
    Functions.sendMsg(guildClient.textChannel, `${Emojis.error} ***Could not find option named \`${settingName}\`***`)
    return
  }
  // If only passed in an option name, return information about that option
  if (args.length === 0) {
    Functions.sendMsg(guildClient.textChannel, Settings.descriptions[settingName](guildClient.settings), guildClient)
    return
  }
  // Modify the value of an option
  const val = args.join()
  Functions.sendMsg(guildClient.textChannel, guildClient.settings.set(keyv, settingName, val), guildClient)
}

/**   DEBUG COMMANDS   */

/**
 * Prints the raw impression of a user.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {String} userId The ID of the user who requested the command.
 * @param {String[]} args The arguments passed with the command.
 */
function rawImpression (guildClient, userId, args) {
  let member = guildClient.members.get(userId).member

  // Finds the member mentioned in the arguments
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

/**
 * Prints all the raw impressions of members in a server.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {String} userId Unused parameter.
 * @param {String[]} args Unused parameter.
 */
function rawImpressions (guildClient, userId, args) {
  const response = ['Raw impressions:']
  guildClient.members.forEach(mmbr => {
    response.push(`    **${mmbr.member.displayName}**: \`${mmbr.impression}\``)
  })
  Functions.sendMsg(guildClient.textChannel, response.join('\n'), guildClient)
}

/**
 * Sets the impression of a member.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {String} userId The ID of the user who requested the command.
 * @param {String[]} args The arguments passed with the command.
 */
function setImpression (guildClient, userId, args) {
  var val = args[0]
  var id = userId
  // If insufficient arguments, return
  if (args.length === 0 || args.length >= 3) return
  // If passed in 2 arguments, sets the mentioned user's impression to a value
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
  // Ensures a member is found, and that the value is a number between the maximum and minimum values
  if (!member || isNaN(val) || val > Config.ImpressionThresholds.MAX_IMPRESSION || val < Config.ImpressionThresholds.MIN_IMPRESSION) return
  member.impression = val
  keyv.set(`${guildClient.guild.id}:${id}:impression`, val)
  Functions.sendMsg(guildClient.textChannel, `Set impression of \`${member.member.displayName}\` to \`${val}\``, guildClient)
}

/**
 * Clears the impressions of all tracked users in a server.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {String} userId Unused parameter.
 * @param {String[]} args Unused parameter.
 */
function clearImpressions (guildClient, userId, args) {
  botClient.guildClients.forEach(gc => gc.members.forEach(usr => {
    usr.impression = 0
    keyv.delete(`${guildClient.guild.id}:${usr.id}:impression`)
  }))
  Functions.sendMsg(guildClient.textChannel, 'Cleared all impressions', guildClient)
}

/**
 * Prints a guildClient to console.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {String} userId Unused parameter.
 * @param {String[]} args Unused parameter.
 */
function printGuild (guildClient, userId, args) {
  console.log(guildClient)
}

/**
 * Prints the members map to console.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {String} userId Unused parameter.
 * @param {String[]} args Unused parameter.
 */
function printMembers (guildClient, userId, args) {
  console.log(guildClient.members)
}

/**
 * Clears Snowboy's database completely and shuts the bot down.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {String} userId Unused parameter.
 * @param {String[]} args Unused parameter.
 */
function clearDb (guildClient, userId, args) {
  keyv.clear()
  Functions.sendMsg(guildClient.textChannel, 'Cleared Database', guildClient).then(() => {
    Functions.sendMsg(guildClient.textChannel, 'Shutting down Snowboy, restart for changes to take effect', guildClient).then(() => {
      process.exit(0)
    })
  })
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

// Commands that alter the voice behavior of SnowBoy through text or voice
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
