const { Emojis, MAX_SONGS } = require('../config')
const YtdlDiscord = require('ytdl-core-discord')
const Ytpl = require('ytpl')
const Ytsearch = require('yt-search')

/**
 * @typedef {Object} VideoConstruct
 * @property {String} url The URL of the video.
 * @property {String} title The title of the video.
 * @property {String} channel The video channel name.
 * @property {String?} description The truncated video description. Missing if fetched from a playlist.
 * @property {String} thumbnail The URL of the video thumbnail.
 * @property {String} duration The duration of the video.
 */

/**
 * Searches YouTube for videos from a query.
 *
 * @param {String} query The search query.
 * @returns {VideoConstruct?} A videoConstruct if a result is found, else undefined.
 */
async function querySearch (query) {
  // Attempt to get result from Youtube
  const result = await Ytsearch(query)

  if (!result.videos || !result.videos[0]) {
    return
  }

  const topResult = result.videos[0]
  // Modifies properties to allow better context within functions
  const videoConstruct = {
    url: topResult.url,
    title: topResult.title,
    channel: topResult.author.name,
    description: topResult.description,
    thumbnail: topResult.thumbnail,
    duration: topResult.timestamp
  }
  return videoConstruct
}

/**
 * Searches YouTube for videos from a URL.
 *
 * @param {String} url The URL.
 * @returns {VideoConstruct?} A videoConstruct if a result is found, else undefined.
 */
async function urlSearch (url) {
  // Attempt to get info from url
  const result = await YtdlDiscord.getBasicInfo(url)

  if (!result || result.videoDetails.isPrivate) {
    return
  }

  const topResult = result.videoDetails
  // Truncates description
  let description = topResult.shortDescription.length > 122 ? topResult.shortDescription.substr(0, 122) + '...' : topResult.shortDescription
  description = description.replace(/\n/gi, ' ')
  const secs = topResult.lengthSeconds % 60
  const mins = Math.floor(topResult.lengthSeconds / 60) % 60
  const hrs = Math.floor(topResult.lengthSeconds / 3600)
  const duration = (hrs > 0 ? hrs + ':' : '') + (mins < 10 ? '0' + mins : mins) + ':' + (secs < 10 ? '0' + secs : secs)
  // Modifies properties to allow better context within functions
  const videoConstruct = {
    url: 'https://www.youtube.com/watch?v=' + topResult.videoId,
    title: topResult.title,
    channel: topResult.author,
    description: description,
    thumbnail: topResult.thumbnail.thumbnails[0].url,
    duration: duration
  }
  return videoConstruct
}

/**
 * Searches a YouTube playlist and queues songs from it.
 *
 * @param {String} url The playlist URL.
 * @returns {VideoConstruct[]?} Returns the Array of created video constructs.
 */
async function playlistSearch (url) {
  const result = await Ytpl(url, { limit: MAX_SONGS })
  const vids = result.items
  const processedVids = []

  if (!vids) {
    return
  }

  vids.forEach((vid) => {
    if (YtdlDiscord.validateURL(vid.url_simple)) {
      processedVids.push({
        url: vid.url_simple,
        title: vid.title,
        channel: vid.author.name,
        thumbnail: vid.thumbnail,
        duration: vid.duration
      })
    }
  })

  processedVids.name = result.title
  return processedVids
}

/**
 * Searches and queues up a query.
 *
 * @param {String} query The search term to search for.
 * @param {String} requester The name of the requester.
 * @param {import('discord.js').TextChannel?} channel The TextChannel to notify through.
 * @returns {VideoConstruct | VideoConstruct[] | undefined} Returns the searched video(s), if any.
 */
async function search (query, requester, guildClient, channel) {
  // Add each video from Youtube playlist
  if (Ytpl.validateURL(query)) {
    guildClient.sendMsg(
      `${Emojis.search} ***Searching for*** \`${query}\``,
      channel
    )
    const playlist = await playlistSearch(query)
    guildClient.sendMsg(
      `${Emojis.checkmark} **Adding \`${playlist.length}\` videos from \`${playlist.name}\`**`,
      channel
    )
    if (playlist) {
      playlist.forEach(video => {
        video.requester = requester
      })
      playlist.playlist = true
    }
    return playlist
  // Directly get info from URL
  } else if (YtdlDiscord.validateURL(query)) {
    guildClient.sendMsg(
      `${Emojis.search} ***Searching for*** \`${query}\``,
      channel
    )
    const video = await urlSearch(query)
    if (video) video.requester = requester
    return video
  // Search query from Youtube
  } else {
    guildClient.sendMsg(
      `${Emojis.search} ***Searching for*** \`${query}\``,
      channel
    )
    const video = await querySearch(query)
    if (video) video.requester = requester
    return video
  }
}

module.exports = {
  search: search
}
