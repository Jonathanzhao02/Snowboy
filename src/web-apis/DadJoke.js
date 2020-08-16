const http = require('https')

/**
 * Gets a random dad joke.
 *
 * @param {Function} callback The callback function where the result is returned.
 */
function get (callback) {
  const method = 'GET'
  const host = 'icanhazdadjoke.com'
  const headers = {
    Accept: 'text/plain',
    'User-Agent': 'Private Snowboy Discord Bot (zhaojonathan99@gmail.com)'
  }

  const options = {
    host: host,
    headers: headers,
    method: method
  }

  // Makes HTTP request to Custom Search API
  const req = http.request(options, resp => {
    resp.setEncoding('utf8')
    let message = ''

    resp.on('data', chunk => {
      message += chunk
    })

    resp.on('end', () => {
      callback(message)
    })
  })
  req.end()
}

exports.get = get
