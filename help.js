const regex = /^\/help/i;
const sender = require('./sender.js')
const disabled = require('./disabled.json')

exports.mod = class helpGener {
	constructor(arr, sender) {
		this.name = 'help'
		this.sender = sender
		this.bots = {}
		for (var i = 0; i < arr.length; i++) {
			if (arr[i].helpString) { this.bots[arr[i].name] = arr[i].helpString }
		}
	}

	checkMessage(message) {
		if (regex.test(message.text)) {
			var helpString = "Here are all the commands I can respond to: \n\n"
			var id = message.group_id
			if (!id) { id = message.chat_id }
			for (var i in this.bots) {
				if (disabled[id]) {
					if (!disabled[id].includes(i.toLowerCase())) {
						helpString += i + ": " + this.bots[i] + "\n"
					}
				} else {
					helpString += i + ": " + this.bots[i] + "\n"
				}
			}
			helpString += "\n\nAll of these commands can be individually disabled by an owner/admin with the command /disable [command name] if they get too spammy\n\nHope that wasn't too much! Remember, you can always type /help to read this again!\n\nIf you enjoy this bot, feel free to add me to another chat!"
			this.sender.send(helpString, message)
		}
	}
}
