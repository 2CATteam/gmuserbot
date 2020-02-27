const sender = require('../sender.js')

exports.mod = class nickname {
	constructor() {
		this.name = "Nickname"
		this.helpString = "/nickname [something] will tell me to change my name. Note that this can fail."
	}

	checkMessage(message, token) {
		if (message.text) {
			const name = message.text.match(/\/nickname\s?(.+)/i)
			if (name && !message.system) {
				if (!message.group_id) {
					sender.send("I can only do that in a group chat", token, message)
					return true;
				}
				sender.nickname(name[1], token, message);
				return true;
			} else {
				return false
			}
		} else return false
	}
}
