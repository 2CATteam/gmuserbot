//var disabled = require('./res/disabled.json')
const sender = require('../sender.js')
const fs = require('fs')
const https = require('https')

exports.mod = class atev {
	constructor() {
	}

	checkMessage(message, token) {
		if (!message.text) {return false}
		var text = message.text.match(/^\/empty/i)
		if (text && (message.sender_id != require('../res.json').user_id)) {
			if (!message.group_id) {
				sender.send("Cannot do that in DMs", token, message)
				return true
			}
			var attachments = [{
				loci: [[0,1]],
				user_ids: [require('../res.json').user_id],
				type: 'mentions'
			}]
			sender.sendWithAtts("", token, message, attachments)
			return true
		}
		return false
	}
}
