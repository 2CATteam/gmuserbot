const triggers = new Map([
	[/^f$/i, (m) => { if (Math.random() < 0.05) { return "F" }}],
	[/^(press|type|say)\s?(.+)\s?(to)?/i, (m) => { return m.match(/^(press|type|say)\s?(.+)\s?(to)?/i)[2] }],
	[/^\/dislike/i, (m) => { return "Your dislike has been noted and recorded." }],
	[/creeper/i, (m) => { return "AW MAN" }],
	[/big\s?$/i, (m) => { return "OOF" }],
	[/69420|42069/i, (m) => { return "Nice." }],
	[/ram\s?ranch/i, (m) => { return "I'm actually allergic to ranch so I can't sorry" }],
	[/I'm\s(.+)$/i, (m) => { return (Math.random() < 0.05 ? "Hi, " + m.match(/I'm\s(.+)$/i)[1] + ", I'm dad!" : null) }],
	[/^\/empty/i, (m) => { return "‎" }]
])

exports.mod = class simples {
	constructor(sender) {
		this.name = "Simples"
		this.helpString = "I say stuff in response to lots of things you say, but it's up to you to find out what they are!"
		this.sender = sender
	}

	checkMessage(message, token) {
		var toReturn = false;
		if (message.sender_id != require('../res.json').user_id) {
			triggers.forEach((value, key, map) => {
				if (key.test(message.text)) {
					let toSend = value(message.text)
					if (toSend) {
						this.sender.send(toSend, message)
						toReturn = true
					}
				}
			})
		}
		return toReturn
	}
}
