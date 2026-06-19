const express = require('express')
const expressWs = require('express-ws')

const app = express()
expressWs(app)

const port = process.env.PORT || 3001
let connects = []

app.use(express.static('public'))

function broadcast(data) {
  const message = JSON.stringify(data)

  connects.forEach((socket) => {
    if (socket.readyState === 1) {
      socket.send(message)
    }
  })
}

app.ws('/ws', (ws, req) => {
  connects.push(ws)

  ws.on('message', (message) => {
    console.log('Received:', message)

    try {
      const data = JSON.parse(message)

      if (data.type === 'chat') {
        broadcast({
          type: 'chat',
          id: data.id,
          name: data.name,
          text: data.text,
          color: data.color,
          time: new Date().toLocaleTimeString('ja-JP', {
            hour: '2-digit',
            minute: '2-digit'
          })
        })
      }

      if (data.type === 'join') {
        broadcast({
          type: 'system',
          text: `${data.name} さんが入室しました。`
        })
      }
    } catch (e) {
      broadcast({
        type: 'system',
        text: 'メッセージの形式が正しくありません。'
      })
    }
  })

  ws.on('close', () => {
    connects = connects.filter((conn) => conn !== ws)
  })
})

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})