const Functions = require('../../bot-util/Functions')
const Guilds = require('../../bot-util/Guilds')
const Impressions = require('../../bot-util/Impressions')
const Emojis = require('../../config').Emojis
const CONFIDENCE_THRESHOLD = require('../../config').CONFIDENCE_THRESHOLD
const Commands = require('../../commands')
const SnowClient = require('../../structures/SnowClient')

module.exports = function (client) {
  /**
   * Handles creation of new members or new SnowClients for untracked users
   * if voice commands are enabled.
   *
   * @param {import('discord.js').GuildMember} member The speaking GuildMember.
   * @param {import('discord.js').Speaking} speaking The speaking state of the GuildMember.
   */
  async function onSpeaking (member, speaking) {
    if (!member || speaking.equals(0) || member.id === client.user.id) return
    const { userClient, guildClient, memberClient } = await Guilds.createClientsFromMember(member)
    if (!guildClient || member.voice.channelID !== guildClient.voiceChannel.id || !guildClient.settings.voice) return
    const childLogger = guildClient.logger

    // If the member is not being listened to, create a new SnowClient and process the audio
    // through all necessary streams
    if (!memberClient.snowClient) {
      childLogger.info('Creating SnowClient for %s', member.displayName)
      const newClient = new SnowClient(memberClient, userClient.settings.sensitivity)
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
      newClient.start(Functions.createAudioStream(member, guildClient.connection.receiver))
      memberClient.snowClient = newClient
      childLogger.info('Successfully created SnowClient for %s', member.displayName)
    }
  }

  /**
   * Parses the user's voice commands.
   *
   * Matches the intents identified by
   * Wit to available commands.
   *
   * @param {Object} result The JSON object returned by Wit.
   * @param {import('../../structures/MemberClient')} memberClient The memberClient of the member triggered the hotword.
   */
  function parse (result, memberClient) {
    if (!memberClient || !memberClient.guildClient.settings.voice) return
    memberClient.logger.info('Received results: %s, %o', result.text, result.intents)

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
    memberClient.logger.debug('Understood command as %s and arguments as %o', commandName, args)

    // Checks all relevant command maps
    if (Commands.bi.get(commandName)) {
      Commands.bi.get(commandName).execute(memberClient, args)
    } else if (Commands.restricted.get(commandName)) {
      Commands.restricted.get(commandName).execute(memberClient, args)
    } else if (Commands.voice.get(commandName)) {
      Commands.voice.get(commandName).execute(memberClient, args)
    } else if (Commands.easteregg.get(commandName)) {
      Commands.easteregg.get(commandName).execute(memberClient, args)
    } else {
      Functions.sendMsg(
        memberClient.guildClient.textChannel,
        `${Emojis.confused} ***Sorry, I don't understand*** "\`${result.text}\`"`
      )
      memberClient.logger.warn('No command found for %s!', commandName)
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
   * @param {import('../../structures/MemberClient')} memberClient The memberClient of the member who triggered the hotword.
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

    Guilds.startTimeout(memberClient.guildClient)
  }

  client.on('guildMemberSpeaking', onSpeaking)
}
