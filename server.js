const express = require('express')
const http = require('http')
const app = express()
const server = http.createServer(app)
const { Server } = require('socket.io')
const io  = new Server(server)
app.use(express.static(__dirname + "/public"))
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html")
})

const players = {
    99999: 'Host',
    88888: 'Items',
    11111: 'Exits',
    00000: 'Player'
}
io.on('connection', (socket) => {
    console.log('user connected')
    socket.on("ZACtx", (msg) => {
        io.emit('Sp', {
            spy: players[msg["mid"]],
            player: msg["mid"]
        })
    })
    socket.on("playerMoved", (pos) => {
        io.emit('playerTrack', pos)
    })
})



server.listen(8080, () => {
    console.log('listening on *:8080')
})