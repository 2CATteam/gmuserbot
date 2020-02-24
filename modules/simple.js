const sender = require('../sender.js')

const triggers = new Map([
	[/^f$/i, (m) => { if (Math.random() < 0.2) return "F" }],
	[/^(press|type|say)\s?(.+)\s?(to)?/i, (m) => { return m.match(/^(press|type|say)\s?(.+)\s?(to)?/i)[2] }],
	[/^\/dislike/i, (m) => { return "Your dislike has been noted and recorded." }],
	[/creeper/i, (m) => { return "AW MAN" }],
	[/big\s?$/i, (m) => { return "OOF" }]
])

exports.mod = class simples {
	constructor() {
		this.name = "Simples"
		this.helpString = "I say stuff in response to lots of things you say, but it's up to you to find out what they are!"
	}

	checkMessage(message) {
		var toReturn = false;
		triggers.forEach((value, key, map) => {
			if (key.test(message.text)) {
				let toSend = value(message.text)
				if (toSend) {
					sender.send(toSend, token, message)
					toReturn = true
				}
			}
		})
		return toReturn
	}
}
