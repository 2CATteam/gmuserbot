var pins = require('./res/pins.json')
const sender = require('../sender.js')
const fs = require('fs')

exports.mod = class pin {
	constructor() {
		this.name = 'pin'
		this.helpString = '/pin [something] will remember a message for you, and /pins will tell you all the messages the bot was told to remember.'
	}

	checkMessage(message, token) {
		if (!message.text) {return false}
		var text = message.text.match(/^\/pin\s(.+)/i)
		if (message.text.match(/^\/pins/i)) {
			var toSend = "Here are all the pinned messages in this chat:\n\n"
			var id = pins[message.group_id] ? message.group_id : message.chat_id
			if (!pins[id]) {
				toSend += "Nothing has been pinned yet!\n"
			} else {
				for (var i in pins[id]) {
					toSend += pins[id][i]
					toSend += "\n"
				}
			}
			toSend += "\nTo add messages, use /pin [something]."
			sender.send(toSend, token, message)
		} else if (text && (message.sender_id != require('../res.json').user_id)) {
			sender.like(message, token)
			this.pin(message, message.name + ": " + text[1])
			return true
		}
		return false
	}

	pin(message, text) {
		if (message.group_id) {
			if (!pins[message.group_id]) {
				pins[message.group_id] = []
			}
			pins[message.group_id].push(text)
		} else if (message.chat_id) {
                        if (!pins[message.chat_id]) {
                                pins[message.chat_id] = []
                        }
                        pins[message.chat_id].push(text)
		}
		fs.writeFileSync(__dirname + '/res/pins.json', JSON.stringify(pins, null, "\t"), 'utf8')
	}
}
