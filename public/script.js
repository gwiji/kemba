const socket = io('/');
const videoGrid = document.getElementById('video-grid');

const myPeer = new Peer({
  host: 'kemba.herokuapp.com',
  secure: true, 
  port: 443,
  path: '/peerjs'
})

const myVideo = document.createElement('video');
myVideo.muted = true;
const peers = {}

$('#strim').click(
    function(){
    strim().then(stream => {
      
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
              //socket.emit('disconnect',roomId, userId)
              $(this).css({display: 'none'});
              connectToNewUser(userId, stream)
              $('#contacts').html('<br><button class="btn btn-danger" id="disconnect">End Call</button>');
          })
          
        })
      
        socket.on('user-disconnected', userId => {
          console.log('peers disconnected',userId);
          //myPeers.close() 
          console.log('disconnected',userId);
          
        })
      
      })
    $(this).css({display: "none"})
    }
);

function strim(){
    return navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
}
/*
socket.on('user-disconnected', userId => {
    console.log('peers',peers)
    if (peers[userId]){ peers[userId].close() 
        console.log('disconnected',userId);
    }

}) */

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
  console.log("id as "+id,"room as "+ROOM_ID)
})

function connectToNewUser(userId, stream) {

  const call = myPeer.call(userId, stream)
  peers[userId] = call
  const video = document.createElement('video')
  video.setAttribute("class",userId)
  
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
            }
        });

        $('video[='+ userId +']' ).css({display: "none"})
        location.replace('https://kemba.herokuapp.com/close')


    });

  })

  call.on('close', () => {
    video.remove()
    socket.emit('disconnect');
    peers[userId].close()
    removeVideoStream(video);
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

