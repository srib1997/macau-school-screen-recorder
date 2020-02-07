const { desktopCapturer, ipcRenderer, remote, shell } = require('electron')
const domify = require('domify')
const ysFixWebmDuration = require('fix-webm-duration')
const path = require('path')
const os = require('os')
const fs = require('fs')

const desktop = path.join(os.homedir(), 'Desktop')
const floderName = '.macau-school'

let localStream
let microAudioStream
let recordedChunks = []
let numRecordedChunks = 0
let recorder
let includeMic = false

var mediaParts
var startTime
var fixblod
var duration
// let includeSysAudio = false

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('#record-desktop').addEventListener('click', recordDesktop)
  // document.querySelector('#record-camera').addEventListener('click', recordCamera)
  // document.querySelector('#record-window').addEventListener('click', recordWindow)
  document.querySelector('#play-video').addEventListener('click', playVideo)
  document.querySelector('#micro-audio').addEventListener('click', microAudioCheck)
  // document.querySelector('#system-audio').addEventListener('click', sysAudioCheck)
  document.querySelector('#record-stop').addEventListener('click', stopRecording)
  document.querySelector('#play-button').addEventListener('click', play)
  document.querySelector('#download-button').addEventListener('click', download)
  document.querySelector('#list-video-floder').addEventListener('click', listVideo)
})

var firstTime = false
var secondTime = false
const listVideo = () => {
  const table = document.querySelector('table')
  const video = document.querySelector('video')
  video.hidden = true
  table.hidden = false

  fs.readdirSync(`${desktop}/${floderName}`).forEach((file, index) => {
    if (firstTime) {
      var child = table.firstElementChild
      // console.log(child)
      table.removeChild(child)
      child = table.firstElementChild
    }

    var tr = document.createElement('TR')
    tr.appendChild(document.createTextNode(file))
    table.appendChild(tr)
    tr.onclick = () => {
      table.hidden = true
      video.hidden = false
      // remote.dialog.showOpenDialog((filePaths) => {
      //   console.log(filePaths)
      // })
      video.muted = false
      video.src = `${desktop}/${floderName}/${tr.innerHTML}`
    }
  })

  if (firstTime) {
    if (secondTime) {
      var child = table.firstElementChild
      // console.log(child)
      table.removeChild(child)
      child = table.firstElementChild
    }
  }
  secondTime = true
  firstTime = true
  const thead = table.createTHead('thead')
  thead.innerHTML = '影片'
  // fs.readdir(`${desktop}/${floderName}`, (err, files) => {
  //   for (i = 0; i < files.length; i++) {
  //     var tr = document.createElement('TR')
  //     tr.appendChild(document.createTextNode(files[i]))
  //     table.appendChild(tr)
  //   }
  // }
  // )
}

const playVideo = () => {
  const table = document.querySelector('table')
  const video = document.querySelector('video')
  table.hidden = true
  video.hidden = false
  remote.dialog.showOpenDialog({ properties: ['openFile'], defaultPath: `${desktop}/${floderName}`, filters: [{ name: 'All Files', extensions: ['webm'] }] }, (filename) => {
    console.log(filename)
    const video = document.querySelector('video')
    video.muted = false
    video.src = filename
  })
}

const disableButtons = () => {
  document.querySelector('#record-desktop').disabled = true
  // document.querySelector('#record-camera').disabled = true
  // document.querySelector('#record-window').disabled = true
  document.querySelector('#record-stop').hidden = false
  document.querySelector('#play-button').hidden = true
  document.querySelector('#download-button').hidden = true
}

const enableButtons = () => {
  document.querySelector('#record-desktop').disabled = false
  // document.querySelector('#record-camera').disabled = false
  // document.querySelector('#record-window').disabled = false
  document.querySelector('#record-stop').hidden = true
  document.querySelector('#play-button').hidden = true
  document.querySelector('#download-button').hidden = true
}

const microAudioCheck = () => {
  // includeSysAudio = false
  // document.querySelector('#system-audio').checked = false

  // Mute video so we don't play loopback audio.
  const table = document.querySelector('table')

  table.hidden = true
  var video = document.querySelector('video')
  video.muted = true
  video.hidden = false

  includeMic = !includeMic
  if (includeMic) { document.querySelector('#micro-audio-btn').classList.add('active') } else { document.querySelector('#micro-audio-btn').classList.remove('active') }
  console.log('Audio =', includeMic)

  if (includeMic) {
    navigator.webkitGetUserMedia({ audio: true, video: false },
      getMicroAudio, getUserMediaError)
  }
}

// function sysAudioCheck () {
// // Mute video so we don't play loopback audio
// var video = document.querySelector('video')
// video.muted = true

// includeSysAudio = !includeSysAudio
// includeMic = false
// document.querySelector('#micro-audio').checked = false
// console.log('System Audio =', includeSysAudio)
// };

const cleanRecord = () => {
  const video = document.querySelector('video')
  video.controls = false
  recordedChunks = []
  numRecordedChunks = 0
}

ipcRenderer.on('source-id-selected', (event, sourceId) => {
  // Users have cancel the picker dialog.
  if (!sourceId) return
  console.log(sourceId)
  onAccessApproved(sourceId)
})

const recordDesktop = () => {
  const table = document.querySelector('table')
  const video = document.querySelector('video')
  table.hidden = true
  video.hidden = false

  cleanRecord()
  ipcRenderer.send('show-picker', { types: ['screen'] })
}

// const recordWindow = () => {
//   cleanRecord()
//   ipcRenderer.send('show-picker', { types: ['window'] })
// }

// const recordCamera = () => {
//   cleanRecord()
//   navigator.webkitGetUserMedia({
//     audio: false,
//     video: { mandatory: { minWidth: 1280, minHeight: 720 } }
//   }, getMediaStream, getUserMediaError)
// }

const recorderOnDataAvailable = (event) => {
  if (event.data && event.data.size > 0) {
    recordedChunks.push(event.data)
    numRecordedChunks += event.data.byteLength
  }
}

const stopRecording = () => {
  const table = document.querySelector('table')
  const video = document.querySelector('video')
  table.hidden = true
  video.hidden = false
  console.log('Stopping record and starting download')
  enableButtons()
  document.querySelector('#play-button').hidden = false
  document.querySelector('#download-button').hidden = false
  recorder.stop()
  localStream.getVideoTracks()[0].stop()
}

const play = () => {
  // Unmute video.
  const table = document.querySelector('table')
  table.hidden = true

  const video = document.querySelector('video')
  video.controls = true
  video.muted = false
  video.hidden = false
  const blob = new Blob(recordedChunks, { type: 'video/webm' })
  ysFixWebmDuration(blob, duration, function (fixedBlob) {
    video.src = window.URL.createObjectURL(fixedBlob)
  })
}

const download = () => {
  const table = document.querySelector('table')
  const video = document.querySelector('video')
  table.hidden = true
  video.hidden = false
  secondTime = false
  var blob = new Blob(recordedChunks, { type: 'video/webm' })

  // console.log(blob, duration)
  ysFixWebmDuration(blob, duration, function (fixedBlob) {
    const url = URL.createObjectURL(fixedBlob)
    const a = document.createElement('a')
    document.body.appendChild(a)
    a.style = 'display: none'
    // a.controls = true;
    a.href = url
    a.download = 'macau school.webm'
    a.dataset.downloadurl = [{ type: 'video/webm' }, a.download, a.href].join(':')
    // a.currentTime = 1e101;
    // a.ontimeupdate = function() {
    //   this.ontimeupdate = ()=>{return;}
    //   a.currentTime = 0;
    // }
    a.click()
    console.log(a)
    setTimeout(function () {
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    }, 100)
  })
  // let blob = new Blob(recordedChunks, {type: 'video/webm'})
}

const getMediaStream = (stream) => {
  const video = document.querySelector('video')
  video.src = URL.createObjectURL(stream)
  localStream = stream
  stream.onended = () => { console.log('Media stream ended.') }

  const videoTracks = localStream.getVideoTracks()

  if (includeMic) {
    console.log('Adding audio track.')
    const audioTracks = microAudioStream.getAudioTracks()
    localStream.addTrack(audioTracks[0])
  }
  // if (includeSysAudio) {
  // console.log('Adding system audio track.')
  // let audioTracks = stream.getoAudioTracks()
  // if (audioTracks.length < 1) {
  // console.log('No audio track in screen stream.')
  // }
  // } else {
  // console.log('Not adding audio track.')
  // }
  try {
    console.log('Start recording the stream.')
    recorder = new MediaRecorder(stream)
  } catch (e) {
    console.assert(false, 'Exception while creating MediaRecorder: ' + e)
    return
  }
  recorder.ondataavailable = recorderOnDataAvailable
  // recorder.onstop = () => { console.log('recorderOnStop fired') }

  mediaParts = []
  recorder.onstop = () => {
    duration = Date.now() - startTime
  }
  recorder.start()
  startTime = Date.now()
  console.log('Recorder is started.')
  disableButtons()
}

const getMicroAudio = (stream) => {
  console.log('Received audio stream.')
  microAudioStream = stream
  stream.onended = () => { console.log('Micro audio ended.') }
}

const getUserMediaError = () => {
  console.log('getUserMedia() failed.')
}

const onAccessApproved = (id) => {
  if (!id) {
    console.log('Access rejected.')
    return
  }
  console.log('Window ID: ', id)
  navigator.webkitGetUserMedia({
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: id,
        maxWidth: window.screen.width,
        maxHeight: window.screen.height
      }
    }
  }, getMediaStream, getUserMediaError)
}
