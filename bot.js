const WebSocket = require('ws')
var faye = require('faye')
var ws = new faye.Client("https://push.groupme.com/faye");
var disabled = require('./disabled.json')
disabled.possible = []

const res = require('./res.json')

var modules = []

const fileRegex = /^[^.].+.js$/

console.log('Starting bot!')

require('fs').readdirSync('./modules').forEach((file) => {
	if (fileRegex.test(file)) {
		let ClassFile = require('./modules/' + file)
		let toAdd = new ClassFile.mod()
		console.log(' Added new module: ' + toAdd.name)
		modules.push(toAdd)
		if (toAdd.name) { disabled.possible.push(toAdd.name.toLowerCase()) }
	}
})

const Help = require('./help.js')

modules.push(new Help.mod(modules))
console.log('Added all modules!')

ws.subscribe(`/user/${res.user_id}`, (message) => {
        console.log(message.subject)
	//console.log(message.subject.attachments[0])
	if (message.type === 'ping') { return }
	checkMessages(message.subject, res.token)
}).then(() => { console.log("Ready!") })

ws.addExtension({
	outgoing: function(message, callback) {
		if (message.channel !== '/meta/subscribe') return callback(message);
		message.ext = message.ext || {};
		message.ext.access_token = res.token;
		message.ext.timestamp = Math.floor(Date.now() / 1000)
		callback(message);
	}
})

function checkMessages(message, token) {
	console.log('Checking messages for an incoming message');
	if (message) {
		if (message.text) { message.text = message.text.replace(/“|”/g,'"').replace(/‘|’/g,"'") }
		for (var module in modules)
		{
			if (message.group_id) { if (modules[module].name) { if (disabled[message.group_id]) { if (disabled[message.group_id].includes(modules[module].name.toLowerCase())) { continue }}}}
			if (modules[module].checkMessage(message, token)) {
				console.log('Message is being handled by ' + modules[module].name)
			}
		}
		disabled = require('./disabled.json')
	}
}
