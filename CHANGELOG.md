# Changelog

## v0.3.2 (PR #24)
Bug fixes, improved logging, voice command fix (very important), and looping support!
* Added better logging context and levels
* Added support for sending arrays in `sendMsg`
* Changed commands that send embeds and a message to send both at once
* Added client destruction to properly cleanup the bot
* Added looping support (addresses #20)
* Fixed voice commands not activating due to missing exclamation mark
* Edited a few messages for better clarity

## v0.3.1 (PR #22)
A little refactoring, better logging, and voice command fix
* Moved `wit.js` and `gsearch.js` into `web_apis` folder
* Moved `commands.js` into `commands` as `index.js`
* Changed many trace-level logs to debug-level
* Fixed voice commands failing due to not calling `.execute()`

## v0.3.0 (PR #21)
Commands refactoring, format editing, new package installation, and basic permission checking
* Refactored all commands into their individual `js` files
  * Refactored `commands` to `biCommands`, commands which work in both text and voice
  * `debugCommands` are only available to developers with ther user IDs listed inside `config.js`
  * `restrictedCommands` are commands available only to users within Snowboy's voice channel or text channel. These modify Snowboy's vocal behavior (i.e. pause, play)
  * `textCommands` or `textOnlyCommands` are text-only, no voice support for them
  * `voiceCommands` or `voiceOnlyCommands` are voice-only, no text support for them
  * Added new `eastereggCommands` category for commands not shown to the user
* Added dynamic command loading into `commands.js`
* Added new command line argument specifying the level at which the logger should log
* Added two new emojis, one for `ping` and one for `stats`
* Refactored common resources (i.e. the database, the bot client, the logger) into a new file named `common.js`
* Added new `mocha` dev dependency in preparation for unit tests
* Added new permission checking for `purge` and `settings` commands

## v0.2.8 (PR #18)
Fixed bugs and added new package
* Moved environemntal variables to a `.env` file with `dotenv` package
* Fixed bugs with logger not logging certain things (still have to make it properly log tracebacks & objects)

## v0.2.7 (PR #17)
Logging capabilities, constant refactoring, and code refactoring
* Added logging to `commands.js`, `index.js`, `snobby.js`, and `bot-utils.js`
* Moved `snowboy.js` constants to config
* Refactored `Streams.silence()` creations into a method `playSilence(guildClient)`
* Moved a few clean-up statements around in `commands.js`

## v0.2.6 (PR #16)
Bug fixes and cleanup
* Fixed bug with embeds while replacing mentions
* Fixed dispatchers not referencing themselves during cleanup
* Removed useless Pino test logging

## v0.2.5 (PR #15)
Bug fixes and new logger
* Fixed regexes only replacing the first instance
* Fixed process not exiting if no guilds are active
* Added a new Pino logger instance

## v0.2.4 (PR #14)
Organization, debugging, and package updates
* Added error logging
* Reorganized `commands.js`
* Updated ytdl-core-discord to personal fork patch (Jonathanzhao02/ytdl-core-discord)

## v0.2.3 (PR #13)
Bug fixes and refactoring
* Removed redundant if statement in `leave`
* Removed `.connection.disconnect()` in `cleanupGuildClient` since that would be handled by the `leave` method
* Reordered parameters in `cleanupGuildClient` from `(botClient, guildClient)` to `(guildClient, botClient)`

## v0.2.2 (PR #12)
More documentation and bug fixes
* Reordered order of functions when removing all listeners or unpiping to better manage resources, especially in `snowboy.js`.
* Added documentation to `streams.js`, `snowboy.js`, and added a line of documentation in `settings.js`.

## v0.2.1 (PR #10, #11)
Bug fixes
* Fixed bug in `replaceMentions` due to syntax error, `guild` was passed in incorrectly.
* Removed `Silence` streams refactoring due to memory leak
* Fixed `VoiceConnectionUDPClient` memory leak due to listener removal

## v0.2.0 (PR #9)
Many changes and bug fixes.
* Moved all value constants to Config.
* Added documentation and comments to all functions and classes.
* Refactored timeout function into a function named `cleanupGuildClient` in `bot-utils`.
* Reformatted spacings for lines that were too long.
* Removed redundant statement in `onMessage`.
* Changed `OWNER_ID` constant to `DEBUG_IDS` array, contains all users able to use debug commands.
* Changed `Settings` text booleans (i.e. 'true' and 'false') to boolean types (i.e. true or false).
* Added more console logging.
* No longer deletes user when no longer listening to them, only deletes the `SnowClient`.
* Split disconnecting due to unforeseen disconnection and disconnecting due to being alone in a channel into two different statements.
* Added delay to disconnecting when alone in a voice channel.
* Changed a few printouts to clarify meanings.
* Refactored `Silence` streams into a single stream at the top of `commands.js`.
* Changed to end current connection's `dispatcher` instead of destroying it to trigger the `finish` event.
* Added `stream.destroy()` to `finish` event to hopefully fix the memory leaks.
* Changed `skip` function to only trigger the `finish` event of the connection.
* Changed `leave` function to also call `disconnect` on the connection and end the current dispatcher, hopefully fixes memory leaks.
* Added more conditions to the `setImpression` debug command.
* Fixed `clearDb` to send messages to guild before exiting.

## v0.1.1 (PR #7)
Various bug fixes.
* Fixed Snowboy ignoring users who deafened/muted themselves.
* Fixed crash on leaving a channel due to using the wrong variable name. (restrictedCommandMap => restrictedCommands)
* Added line so that when the bot client crashes, the error is written to console.

## v0.1.0
Initial commit.
