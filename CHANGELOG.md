# Changelog

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
