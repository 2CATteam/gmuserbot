const WebSocket = require('ws')
const ws = new WebSocket("wss://push.groupme.com/faye");
const res = require('./res.json')

id = 0

ws.on('message', (data) => {
	data = JSON.parse(data)
	if (data[0].channel === "/meta/handshake") {
		ws.send(JSON.stringify([{
			channel: "/meta/subscribe",
			clientId: data[0].clientId,
			subscription: `/user/${res.user_id}`,
			id: id,
			ext: {
				access_token: res.token,
				timestamp: Math.floor(Date.now() / 1000)
			}
		}]), (err) => { if (err) { console.log(err) } })
	} else if (data[0].channel === "/meta/subscribe") {
		ws.send(JSON.stringify([{
			channel: "/meta/connect",
			clientId: data[0].clientId,
			connectionType: "websocket",
			id: id
		}]), (err) => { if (err) { console.log(err) } })
		console.log('Ready!')
	} else if (data[0].data.type === 'ping' || data[0].data.type === 'subscribe') {
		
	} else {
		console.log(data[0].data.subject)
		console.log(data[0].data.subject.text)
	}
	id++
})

ws.on('open', () => {
	ws.send(JSON.stringify([{
		channel: "/meta/handshake",
		version: "1.0",
		supportedConnectionTypes: ["websocket"],
		id: id
	}]), (err) => { if (err) { console.log(err) } })
	id++
})

ws.on('error', (err) => {
	console.log(err)
})

function checkMessages(message, token) {
	console.log('Checking messages for an incoming message');
	console.log(message)
	for (var module in modules)
	{
		if (modules[module].checkMessage(message, token)) {
			console.log('Message is being handled by ' + modules[module].name)
		}
	}
}
