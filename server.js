const express = require('express')
const { ExpressPeerServer } = require('peer');
const cors = require('cors');

const peerServer = ExpressPeerServer(serve, {
  debug: true
});

app.use(cors());
app.use('/peerjs', peerServer);

const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
  if(req.params.room != 'favicon.ico'){
    if(req.params.room == 'close'){
        res.render('room-closed')
        console.log(req.params.room)
      }else{
        res.render('room', { roomId: req.params.room });
        console.log(req.params.room);
      }
  }

})

io.on('connection', socket => {
  
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    socket.to(roomId).broadcast.emit('user-connected', userId)
    
    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
    })
  })

})

const serve = server.listen(process.env.PORT || 3000)
