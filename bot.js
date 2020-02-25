const WebSocket = require('ws')
const ws = new WebSocket("wss://push.groupme.com/faye");
const res = require('./res.json')

var modules = []

const fileRegex = /^[^.].+.js/

console.log('Starting bot!')

require('fs').readdirSync('./modules').forEach((file) => {
	if (fileRegex.test(file)) {
		let ClassFile = require('./modules/' + file)
		let toAdd = new ClassFile.mod()
		console.log(' Added new module: ' + toAdd.name)
		modules.push(toAdd)
	}
})

const Help = require('./help.js')

modules.push(new Help.mod(modules))
console.log('Added all modules!')

id = 0

ws.on('message', (data) => {
	data = JSON.parse(data)
	console.log(data)
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
		}]), (err) => { if (err) {
			console.log(err)
			console.log(data[0])
			return
		} })
		console.log('Ready!')
	} else if (!data[0].data) {
		console.log(data)
	} else if (data[0].data.type === 'ping' || data[0].data.type === 'subscribe') {

	} else {
		console.log(data[0].data.subject)
		checkMessages(data[0].data.subject, res.token)
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

ws.on('close', () => {
	console.log('Disconnected')
	ws = new WebSocket("wss://push.groupme.com/faye");
})

function checkMessages(message, token) {
	console.log('Checking messages for an incoming message');
	for (var module in modules)
	{
		if (modules[module].checkMessage(message, token)) {
			console.log('Message is being handled by ' + modules[module].name)
		}
	}
}
