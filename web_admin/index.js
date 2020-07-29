const path = require('path')
const fs = require('fs')
const { exec } = require('child_process')

console.log('\033[2J')

const fileName = path.resolve(__dirname, '../logs/latest.log')

fs.open(fileName, 'r', (err, fd) => {
  if (err) throw err
  fs.watchFile(
    fileName,
    {
      persistent: true,
      interval: 1000
    },
    (curr, prev) => {
      printFile(fd, prev.size, curr.size)
    }
  )
})

function printFile (file, oldSize, newSize) {
  const readBytes = newSize - oldSize
  const buf = Buffer.alloc(readBytes)
  fs.read(file, buf, 0, readBytes, oldSize, (err, numBytes, data) => {
    if (err) throw err
    const command = `echo "${data.toString('utf8').replace(/\\"/gi, '\\\\\\"').replace(/(?<!\\)"/gi, '\\"').replace(/(?<!\\)`/gi, '\\`')}" | pino-pretty`
    exec(command, (err, res, stErr) => {
      if (err) throw err
      if (stErr) console.log(stErr)
      console.log(res)
    })
  })
}
