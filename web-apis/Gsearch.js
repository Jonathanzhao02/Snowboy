const http = require('https')

var accessToken

/**
 * Sets the API key.
 *
 * @param {String} key The API key.
 */
function setKey (key) {
  accessToken = key
}

/**
 * Searches up a query and returns the result in a callback.
 *
 * @param {String} qry The search query.
 * @param {Function} callback The callback function where the result is returned.
 */
function search (qry, callback) {
  const method = 'GET'
  const host = 'www.googleapis.com'
  const path = '/customsearch/v1?'
  const query = `key=${accessToken}&q=${qry.replace(/ +/gi, '+')}&cx=001359467268259198197:pj71gnzvmza`

  const options = {
    host: host,
    path: path + query,
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
      callback(JSON.parse(message).items[0])
    })
  })
  req.end()
}

exports.search = search
exports.setKey = setKey
