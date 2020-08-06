const socket = io('/')
const videoGrid = document.getElementById('video-grid')

const myPeer = new Peer({
  host: 'peerjs-server.herokuapp.com',
  secure: true, 
  port: 443
})

const myVideo = document.createElement('video');
myVideo.muted = true;
const peers = {}

navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {

  addVideoStream(myVideo, stream)

  myPeer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')

    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
        $('#disconnect').click(function(){
            call.close();
            console.log('disconnect');
        });
    })
  })

  socket.on('user-connected', userId => {
    $('#contacts').html('<br><button class="call btn btn-primary text-center">Share Video</button>');
    $('.call').click(function(){
        $(this).css({display: 'none'});
        connectToNewUser(userId, stream)//addVideoStream(video, userVideoStream)
        $('#contacts').html('<br><button class="btn btn-danger" id="disconnect">End Call</button>');
    })
    
  })
})

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})

myPeer.on('close', id => {
    socket.disconnect();
  })

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  
  call.on('stream', userVideoStream => {
    $('#disconnect').click(function(){
        call.close();
        //socket.disconnect();
        console.log('disconnect');
    });
  })

  call.on('close', () => {
    video.remove()
    socket.disconnect();
    peers[userId].close()
  })

  peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}

