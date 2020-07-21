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
  var method = 'GET'
  var host = 'www.googleapis.com'
  var path = '/customsearch/v1?'
  var query = `key=${accessToken}&q=${qry.replace(/ +/gi, '+')}&cx=001359467268259198197:pj71gnzvmza`

  var options = {
    host: host,
    path: path + query,
    method: method
  }

  // Makes HTTP request to Custom Search API
  var req = http.request(options, resp => {
    resp.setEncoding('utf8')
    var message = ''

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
