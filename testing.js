const Discord = require('discord.js')
const Config = require('./config')
const Streams = require('./streams')

const discordClient = new Discord.Client()

function join (channel, guildId, userId) {
  channel.join().then(connection => connectionHandler(connection, channel)).catch(e => {
    console.log('Could not connect')
    console.error(e)
  })
}

function connectionHandler (connection, channel) {
  console.log('Connected!')

  var audioStream

  connection.play(new Streams.Silence(), { type: 'opus' })

  connection.on('speaking', (user, speaking) => {
    console.log('SPEAKING!!!')

    if (!audioStream) {
      audioStream = connection.receiver.createStream(user, {
        mode: 'pcm',
        end: 'manual'
      })

      audioStream.on('data', chunk => {})
    }
  })
}

discordClient.on('message', msg => {
  if (!msg.content.startsWith(Config.BOT_PREFIX)) return
  if (msg.author.bot) return
  const content = msg.content.substr(1).toLowerCase()

  console.log(`Received ${msg.content}`)

  if (content.startsWith('join')) {
    join(msg.member.voice.channel)
  }
})

discordClient.on('guildMemberSpeaking', (member, speaking) => {
  console.log(member.voice.channel)
})

discordClient.login(process.env.TEST_BOT_TOKEN)
