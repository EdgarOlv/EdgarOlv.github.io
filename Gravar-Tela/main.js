//Fonte: https://www.educative.io/edpresso/how-to-create-a-screen-recorder-in-javascript

var data = new Date()
var dataFormatada =
  ('0' + data.getDate()).substr(-2) +
  '/' +
  ('0' + (data.getMonth() + 1)).substr(-2) +
  '/' +
  data.getFullYear()

function executar() {
  log.textContent = 'Por favor, selecione a tela para gravar.'
  requestStream()
}

function requestStream() {
  navigator.mediaDevices
    .getDisplayMedia({
      video: { mediaSource: 'screen', chromeMediaSource: 'screen' },
      audio: true
    })
    .then(startRecorder)
    .catch(
      e =>
        (log.textContent =
          'Falha ao conseguir gravar essa tela. Atualize seu navegador ou use outro.')
    )
}

function startRecorder(stream) {
  const chunks = []
  const recorder = new MediaRecorder(stream)
  recorder.ondataavailable = e => chunks.push(e.data)
  recorder.onstop = e => saveFile(chunks)
  recorder.start()
  btn.onclick = e => recorder.stop()
  btn.textContent = 'Parar gravacao'
  const video = document.createElement('video')
  //video.srcObject = stream;
  //video.play();
  //document.body.append(video);
  log.textContent = 'Gravando...'

  function exportVid(blob) {
    log.textContent = 'Gravação finalizada!'
    btn.remove()
    video.srcObject = null
    video.src = URL.createObjectURL(blob)
    video.controls = true
  }
}

function saveFile(chunks) {
  const video = document.createElement('video')
  video.srcObject = null
  log.textContent = 'Gravacao finalizada!'
  btn.remove()

  const blob = new Blob(chunks, {
    type: 'video/mp4'
    // type: 'video/webm'
  })
  let filename = 'Teste_' + dataFormatada,
    downloadLink = document.createElement('a')
  downloadLink.href = URL.createObjectURL(blob)
  downloadLink.download = `${filename}.mp4`

  document.body.appendChild(downloadLink)
  downloadLink.click()
  URL.revokeObjectURL(blob) // clear from memory
  document.body.removeChild(downloadLink)
}
