const http = require('https')

/**
 * Gets a random dad joke.
 *
 * @returns {Promise<String>} Returns the dad joke as a string.
 */
function get () {
  return new Promise((resolve, reject) => {
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
        if (resp.statusCode !== 200) reject(new Error(`Invalid status code ${resp.statusCode}`))
        else resolve(message)
      })
    })
    req.end()
  })
}

exports.get = get
