/**
 * Contains all arguments for a command, with some nice utility methods.
 *
 * @param {String[]?} args The array of string arguments.
 * @param {import('discord.js').MessageMentions?} mentions The mentions from the message.
 */
function CommandArguments (args, mentions) {
  /**
   * The raw argument array.
   * @type {String[]}
   */
  this.data = args || []

  /**
   * The mentions from the message.
   * @type {import('discord.js').MessageMentions?}
   */
  this.mentions = mentions

  /**
   * The length of the arguments.
   * @type {Number}
   */
  Object.defineProperty(this, 'length', {
    get: _ => this.data.length
  })

  /**
   * Whether the arguments are empty.
   * @type {Boolean}
   */
  Object.defineProperty(this, 'empty', {
    get: _ => this.data.length === 0
  })

  /**
   * The first argument.
   * @type {String}
   */
  Object.defineProperty(this, 'first', {
    get: _ => this.data[0]
  })

  /**
   * The last argument.
   * @type {String}
   */
  Object.defineProperty(this, 'last', {
    get: _ => this.data[this.data.length - 1]
  })
}

/**
 * Returns the first numerical argument, if it exists.
 *
 * @param {Number} max The exclusive maximum argument position to read to.
 * @returns {Number} Returns the first numerical argument.
 */
CommandArguments.prototype.firstNumerical = function (max = this.data.length) {
  return this.data.find((val, index) => index < max && !isNaN(val)) | NaN
}

/**
 * Extracts the first numerical argument from the arguments, if it exists.
 *
 * @param {Number} max The exclusive maximum argument position to read to.
 * @returns {Number} Returns the first numerical argument.
 */
CommandArguments.prototype.extractNumerical = function (max = this.data.length) {
  const index = this.data.findIndex((val, i) => i < max && !isNaN(val))
  return index === -1 ? NaN : Number(this.data.splice(index, 1))
}

/**
 * Checks if a numerical argument exists.
 *
 * @param {Number} max The exclusive maximum argument position to read to.
 * @returns {Number} Returns the index if it exists, -1 if it doesn't.
 */
CommandArguments.prototype.findNumerical = function (max = this.data.length) {
  const index = this.data.findIndex((val, i) => i < max && !isNaN(val))
  return index
}

/**
 * Returns the first channel mention, if it exists.
 *
 * @param {Number} max The exclusive maximum argument position to read to.
 * @returns {import('discord.js').Channel?} Returns the first channel mention.
 */
CommandArguments.prototype.firstChannelMention = function (max = this.data.length) {
  if (!this.mentions) return null
  return this.data.find((val, index) => index < max && this.mentions.channels.find(chan => chan.toString() === val))
}

/**
 * Extracts the first channel mention from the arguments, if it exists.
 *
 * @param {Number} max The exclusive maximum argument position to read to.
 * @returns {import('discord.js').Channel?} Returns the first channel mention.
 */
CommandArguments.prototype.extractChannelMention = function (max = this.data.length) {
  if (!this.mentions) return null
  let channel = null
  const index = this.data.findIndex((val, index) => index < max && (channel = this.mentions.channels.find(chan => chan.toString() === val)))
  if (index !== -1) this.data.splice(index, 1)
  return channel
}

/**
 * Checks if a channel mention exists.
 *
 * @param {Number} max The exclusive maximum argument position to read to.
 * @returns {Number} Returns the index if it exists, -1 if it doesn't.
 */
CommandArguments.prototype.findChannelMention = function (max = this.data.length) {
  if (!this.mentions) return -1
  const index = this.data.findIndex((val, index) => index < max && this.mentions.channels.find(chan => chan.toString() === val))
  return index
}

/**
 * Returns the first member mention, if it exists.
 *
 * Also takes into account nickname mentions (contains '!').
 *
 * @param {Number} max The exclusive maximum argument position to read to.
 * @returns {import('discord.js').GuildMember?} Returns the first member mention.
 */
CommandArguments.prototype.firstMemberMention = function (max = this.data.length) {
  if (!this.mentions) return null
  return this.data.find((val, index) => index < max && this.mentions.members.find(memb => memb.toString() === val))
}

/**
 * Extracts the first member mention from the arguments, if it exists.
 *
 * Also takes into account nickname mentions (contains '!').
 *
 * @param {Number} max The exclusive maximum argument position to read to.
 * @returns {import('discord.js').GuildMember?} Returns the first member mention.
 */
CommandArguments.prototype.extractMemberMention = function (max = this.data.length) {
  if (!this.mentions) return null
  let member = null
  const index = this.data.findIndex((val, index) => index < max && (member = this.mentions.members.find(memb => memb.toString() === val || memb.toString() === val.replace('!', ''))))
  if (index !== -1) this.data.splice(index, 1)
  return member
}

/**
 * Checks if a member mention exists.
 *
 * @param {Number} max The exclusive maximum argument position to read to.
 * @returns {Number} Returns the index if it exists, -1 if it doesn't.
 */
CommandArguments.prototype.findMemberMention = function (max = this.data.length) {
  if (!this.mentions) return -1
  const index = this.data.findIndex((val, index) => index < max && this.mentions.members.find(memb => memb.toString() === val || memb.toString() === val.replace('!', '')))
  return index
}

/**
 * Returns the first user mention, if it exists.
 *
 * @param {Number} max The exclusive maximum argument position to read to.
 * @returns {import('discord.js').User?} Returns the first user mention.
 */
CommandArguments.prototype.firstUserMention = function (max = this.data.length) {
  if (!this.mentions) return null
  return this.data.find((val, index) => index < max && this.mentions.users.find(user => user.toString() === val))
}

/**
 * Extracts the first user mention from the arguments, if it exists.
 *
 * @param {Number} max The exclusive maximum argument position to read to.
 * @returns {import('discord.js').User?} Returns the first user mention.
 */
CommandArguments.prototype.extractUserMention = function (max = this.data.length) {
  if (!this.mentions) return null
  let user = null
  const index = this.data.findIndex((val, index) => index < max && (user = this.mentions.users.find(usr => usr.toString() === val)))
  if (index !== -1) this.data.splice(index, 1)
  return user
}

/**
 * Checks if a user mention exists.
 *
 * @param {Number} max The exclusive maximum argument position to read to.
 * @returns {Number} Returns the index if it exists, -1 if it doesn't.
 */
CommandArguments.prototype.findUserMention = function (max = this.data.length) {
  if (!this.mentions) return -1
  const index = this.data.findIndex((val, index) => index < max && this.mentions.users.find(usr => usr.toString() === val))
  return index
}

/**
 * Returns the arguments joined as a string.
 *
 * @param {Number} startPoint The first position to join.
 * @param {Number} endPoint The exclusive last position to join.
 * @param {String} separator The separator between the arguments.
 * @returns {String} Returns the joined arguments.
 */
CommandArguments.prototype.join = function (startPoint = 0, endPoint = this.data.length, separator = ' ') {
  return this.data.slice(startPoint, endPoint).join(separator[0])
}

/**
 * @returns {String} Extracts the first argument.
 */
CommandArguments.prototype.shift = function () {
  return this.data.shift()
}

/**
 * @returns {String} Extracts the last argument.
 */
CommandArguments.prototype.pop = function () {
  return this.data.pop()
}

/**
 * Gets the specified index from the arguments.
 *
 * @param {Number} index The index to fetch.
 * @returns {String} Gets the positional argument.
 */
CommandArguments.prototype.get = function (index) {
  return this.data[index]
}

/**
 * Extracts the specified index from the arguments.
 *
 * @param {Number} index The index to fetch.
 * @returns {String} Extracts the positional argument.
 */
CommandArguments.prototype.extract = function (index) {
  return this.data.splice(index, 1)
}

/**
 * Returns the first argument that meets the condition, if it exists.
 *
 * @param {Function} filter The filter to apply.
 * @returns {Number} Returns the first argument matching the filter.
 */
CommandArguments.prototype.where = function (filter) {
  return this.data.find(filter)
}

module.exports = CommandArguments
