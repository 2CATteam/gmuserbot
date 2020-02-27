const sender = require('../sender.js')

exports.mod = class welcome {
	constructor() {
		this.name = "Welcome"
	}

	checkMessage(message, token) {
		if(message.system && message.text.match(/^.+added Lowes to the group.$/i)) {
			sender.send("Welcome to Lowes. Would you like to buy some wood? We sell that, as well as lots of power tools. Or, if you just want to start using me as a bot, type /help for my list of commands", token, message)
		}
	}
}
