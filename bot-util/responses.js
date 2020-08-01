const random = require('./functions').random

// The list of greetings used for when the bot joins
const greetings = [
  'Hey there',
  'Hi',
  '\'Sup',
  'Hey',
  'Hello',
  'Que pasa',
  'Long time no see',
  'I\'ve missed you',
  'It\'s great to see ya',
  'It\'s good to see you',
  'Nice to see you',
  'Ahoy',
  'Howdy',
  'Good to see you',
  'Looking good',
  'Looking sharp as always',
  'Great seeing you'
]

// The list of farewells used for when the bot leaves
const farewells = [
  'Goodbye',
  'See ya',
  'Adios',
  'Bye bye',
  'Bye',
  'Later',
  'I\'ll miss ya',
  'See you later',
  'Take it easy',
  'Have a nice day',
  '\'Til next time',
  'Take care',
  'It was nice to see you',
  'Peace',
  'See you soon',
  'I\'ll always be here for you'
]

function randomGreeting () {
  return greetings[random(greetings.length)]
}

function randomFarewell () {
  return farewells[random(farewells.length)]
}

module.exports = {
  randomGreeting: randomGreeting,
  randomFarewell: randomFarewell
}
