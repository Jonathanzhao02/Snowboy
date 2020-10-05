const path = require('path')

// Dir for logging
const defaultLogdir = path.resolve(__dirname, '../logs')

// Dir for databases
const defaultDbdir = path.resolve(__dirname, '../db')

// Dir for resources
const defaultResdir = path.resolve(__dirname, './resources')

// Dir for .env
const defaultEnvdir = path.resolve(__dirname, '../')

// Default bot prefix is '%'
const DEFAULT_BOT_PREFIX = '%'

// Default impression system active
const DEFAULT_IMPRESSIONS = true

// Default voice commands active
const DEFAULT_VOICE = true

// Default mentions active
const DEFAULT_MENTIONS = true

// Default sensitivity for Snowboy
const DEFAULT_SENSITIVITY = '0.45'

// Time before Snowboy automatically disconnects due to inactivity
const GUILD_TIMEOUT = 300000

// Time before a MemberClient is automatically cleaned up due to inactivity
const MEMBER_TIMEOUT = 300000

// Time before Snowboy automatically disconnects from a channel after being alone
const ALONE_TIMEOUT = 10000

// Time before a poll ends by default
const POLL_TIME = 30000

// Max time before a poll ends
const MAX_POLL_TIME = 1800000

// Threshold of how confident Snowboy should be in an intent before accepting it
const CONFIDENCE_THRESHOLD = 0.6

// Maximum time for a voice query command
const MAX_QUERY_TIME = 8000

// Maximum silence before a query is forcibly finished
const SILENCE_QUERY_TIME = 2500

// User IDs of users who are able to use debug commands, feel free to add your's
const DEBUG_IDS = ['290237225596092416']

// Maximum number of songs from a playlist, 0 = unlimited.
const MAX_SONGS = 50

// Impression value changes for each action
const HAPPY_VALUE = +2
const GREET_VALUE = +1
const NEVERMIND_VALUE = -1
const SAD_VALUE = -3
const GROSS_VALUE = -5

// The thresholds for each likability level
// Descending order, <= and > previous threshold
const HATE_THRESHOLD = -66
const DISLIKE_THRESHOLD = -30
const SLIGHT_DISLIKE_THRESHOLD = -10
const NEUTRAL_THRESHOLD = 10
const SLIGHT_LIKE_THRESHOLD = 30
const LIKE_THRESHOLD = 66
const LOVE_THRESHOLD = 100

const MAX_IMPRESSION = 100
const MIN_IMPRESSION = -100

// All emojis used for messages
const EMOJIS = {
  checkmark: '✅',
  error: '❌',
  invite: '✉️',
  settings: '⚙️',
  stats: '📊',
  ping: '📶',
  clock: '🕒',
  playing: '▶️',
  pause: '⏸️',
  loop: '🔁',
  greeting: '👋',
  farewell: '👋',
  mute: '🔇',
  unmute: '🔊',
  skip: '⏩',
  stop: '🛑',
  queue: '⌛',
  rabbit: '🐰',
  search: '🔎',
  dice: '🎲',
  heads: '😐',
  tails: '🐕',
  trash: '🗑',
  skull: '💀',
  unknown: '😕',
  confused: '🤔',
  sad: '😔',
  angry: '😡',
  weird: '😒',
  annoyed: '☹️',
  neutral: '😐',
  content: '🙂',
  happy: '😊',
  joyful: '😄',
  y: '🇾',
  n: '🇳'
}

// Miscellaneous config constants
const LOVE_BINGUS = 'https://tenor.com/view/bingus-cat-hairless-love-bingus-bingus-club-gif-18607003'
const HATE_BINGUS = 'https://tenor.com/view/bingus-stupid-bingus-toxicbabes-gif-18572626'

module.exports = {
  CONFIDENCE_THRESHOLD: CONFIDENCE_THRESHOLD,
  DEBUG_IDS: DEBUG_IDS,
  MAX_SONGS: MAX_SONGS,
  Paths: {
    defaultLogdir: defaultLogdir,
    defaultDbdir: defaultDbdir,
    defaultEnvdir: defaultEnvdir,
    defaultResdir: defaultResdir
  },
  Timeouts: {
    GUILD_TIMEOUT: GUILD_TIMEOUT,
    MEMBER_TIMEOUT: MEMBER_TIMEOUT,
    ALONE_TIMEOUT: ALONE_TIMEOUT,
    MAX_QUERY_TIME: MAX_QUERY_TIME,
    SILENCE_QUERY_TIME: SILENCE_QUERY_TIME,
    POLL_TIME: POLL_TIME,
    MAX_POLL_TIME: MAX_POLL_TIME
  },
  SettingsValues: {
    DEFAULT_BOT_PREFIX: DEFAULT_BOT_PREFIX,
    DEFAULT_IMPRESSIONS: DEFAULT_IMPRESSIONS,
    DEFAULT_VOICE: DEFAULT_VOICE,
    DEFAULT_MENTIONS: DEFAULT_MENTIONS,
    DEFAULT_SENSITIVITY: DEFAULT_SENSITIVITY
  },
  ImpressionValues: {
    HAPPY_VALUE: HAPPY_VALUE,
    GREET_VALUE: GREET_VALUE,
    NEVERMIND_VALUE: NEVERMIND_VALUE,
    SAD_VALUE: SAD_VALUE,
    GROSS_VALUE: GROSS_VALUE
  },
  ImpressionThresholds: {
    HATE_THRESHOLD: HATE_THRESHOLD,
    DISLIKE_THRESHOLD: DISLIKE_THRESHOLD,
    SLIGHT_DISLIKE_THRESHOLD: SLIGHT_DISLIKE_THRESHOLD,
    NEUTRAL_THRESHOLD: NEUTRAL_THRESHOLD,
    SLIGHT_LIKE_THRESHOLD: SLIGHT_LIKE_THRESHOLD,
    LIKE_THRESHOLD: LIKE_THRESHOLD,
    LOVE_THRESHOLD: LOVE_THRESHOLD,
    MAX_IMPRESSION: MAX_IMPRESSION,
    MIN_IMPRESSION: MIN_IMPRESSION
  },
  Emojis: EMOJIS,
  Misc: {
    LOVE_BINGUS: LOVE_BINGUS,
    HATE_BINGUS: HATE_BINGUS
  }
}
