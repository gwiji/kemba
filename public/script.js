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
        console.log('Peer on stream');
    })
  })

  socket.on('user-connected', userId => {
    console.log('peers connected',peers)
    $('#contacts').html('<br><button class="call btn btn-primary text-center">Share Video</button>');
    $('.call').click(function(){
        $(this).css({display: 'none'});
        connectToNewUser(userId, stream)
        $('#contacts').html('<br><button class="btn btn-danger" id="disconnect">End Call</button>');
    })
    
  })

  socket.on('user-disconnected', userId => {
    console.log('peers disconnected',userId);
    peers[userId].close() 
    console.log('disconnected',userId);
    
  })

})
/*
socket.on('user-disconnected', userId => {
    console.log('peers',peers)
    if (peers[userId]){ peers[userId].close() 
        console.log('disconnected',userId);
    }

}) */

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
  console.log(id,ROOM_ID)
})

myPeer.on('close', id => {
    socket.disconnect();
    console.log('Peer disconnected'+id);
  })

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)

    $('#disconnect').click(function(){
        video.remove()
        call.close();
        socket.disconnect();
        $(this).css({display: "none"});
        userVideoStream.getTracks().forEach(function(track) {
            if (track.readyState == 'live') {
                track.stop();
                console.log('Rec stopped')
            }
        });
    });

  })

  peers[userId] = call

  call.on('close', () => {
    video.remove()
    socket.disconnect();
    peers[userId].close()
    removeVideoStream(video);
    console.log('call closed');
  })

}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  });

  videoGrid.appendChild(video)
}

function removeVideoStream(video) {
    $(video).css({display: 'none'})
}

