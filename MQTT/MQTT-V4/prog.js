// Called after form input is processed
function startConnect() {
  // Generate a random client ID
  clientID = 'Usuario-' + parseInt(Math.random() * 100)

  host = 'tailor.cloudmqtt.com'
  port = 32415

  client = new Paho.MQTT.Client(host, Number(port), clientID)

  // Print output for the user in the messages div
  document.getElementById('messages').innerHTML +=
    '<span>Conectando em: ' + host + ' Porta: ' + port + '</span><br/>'
  document.getElementById('messages').innerHTML +=
    '<span>Identificacao do Usuario: ' + clientID + '</span><br/>'

  // Set callback handlers
  client.onConnectionLost = onConnectionLost
  client.onMessageArrived = onMessageArrived

  // Connect the client, if successful, call onConnect function

  var options = {
    useSSL: true,
    timeout: 3,
    userName: 'bevcctrk',
    password: 'eXGg885Wmm_I',
    onSuccess: onConnect
  }

  client.connect(options)
}

function GiraManual() {
  ValorManual = document.getElementById('rotacao_manual').value

  let message = new Paho.MQTT.Message(ValorManual)
  message.destinationName = 'Exp/Manual'
  client.send(message)

  document.getElementById('messages').innerHTML +=
    '<span>Publicado: ' +
    ValorManual +
    ' - Em ' +
    message.destinationName +
    '</span><br/>'
}

function GiraAutomatico() {
  ValorAut = document.getElementById('rotacao_automatico').value

  let message = new Paho.MQTT.Message(ValorAut)
  message.destinationName = 'Exp/Automatico'
  client.send(message)

  document.getElementById('messages').innerHTML +=
    '<span>Publicado: ' +
    ValorAut +
    ' - Em ' +
    message.destinationName +
    '</span><br/>'
}

// Called when the client connects
function onConnect() {
  // Fetch the MQTT topic from the form
  //topic = document.getElementById('topic').value
  topic = 'Exp/Luminosidade'
  topic2 = 'Exp/Ativo'
  // Print output for the user in the messages div
  document.getElementById('messages').innerHTML +=
    '<span>Inscrito em: ' + topic + ' e ' + topic2 + '</span><br/>'

  // Subscribe to the requested topic
  client.subscribe(topic)
  client.subscribe(topic2)
}

// Called when the client loses its connection
function onConnectionLost(responseObject) {
  console.log('onConnectionLost: Connection Lost')
  if (responseObject.errorCode !== 0) {
    console.log('onConnectionLost: ' + responseObject.errorMessage)
  }
}

// Called when a message arrives
function onMessageArrived(message) {
  var luminosidade
  var ativo

  console.log(
    'onMessageArrived: ' +
      message.destinationName +
      ' - ' +
      message.payloadString
  )

  if (message.destinationName == 'Exp/Luminosidade') {
    document.getElementById('luminosidade').innerHTML = message.payloadString
  }else 
  if (message.destinationName == 'Exp/Ativo') {
    document.getElementById('status').innerHTML = message.payloadString
  } else {
    document.getElementById('messages').innerHTML +=
      '<span>Topic: ' +
      message.destinationName +
      '  | ' +
      message.payloadString +
      '</span><br/>'
    updateScroll() // Scroll to bottom of window
  }
}

// Called when the disconnection button is pressed
function startDisconnect() {
  client.disconnect()
  document.getElementById('messages').innerHTML +=
    '<span>Desconectado</span><br/>'
  updateScroll() // Scroll to bottom of window
}

// Updates #messages div to auto-scroll
function updateScroll() {
  var element = document.getElementById('messages')
  element.scrollTop = element.scrollHeight
}
