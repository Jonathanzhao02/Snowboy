const http = require('https')

var accessToken

function setKey (key) {
  accessToken = key
}

function search (qry, callback) {
  var method = 'GET'
  var host = 'www.googleapis.com'
  var path = '/customsearch/v1?'
  var query = `key=${accessToken}&q=${qry.replace(' ', '+')}&cx=001359467268259198197:pj71gnzvmza`

  var options = {
    host: host,
    path: path + query,
    method: method
  }

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
