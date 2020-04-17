//var disabled = require('./res/disabled.json')
const sender = require('../sender.js')
const fs = require('fs')
const https = require('https')

exports.mod = class atev {
	constructor() {
		this.name = '!important'
		this.helpString = "If you start a message with !important, I'll ask people to acknowledge the message by liking it and, if they don't, I'll remind them one, three, and twenty-four hours after the message is sent."
	}

	checkMessage(message, token) {
		if (!message.text) {return false}
		var text = message.text.match(/^!important/i)
		if (text && (message.sender_id != require('../res.json').user_id)) {
			if (!message.group_id) {
				sender.send("Cannot do that in DMs", token, message)
				return true
			}
			sender.like(message, token);
			sender.send("Please acknowledge the above message by liking it.", token, message)
			sender.getMembers(message, token, (result) => {
				if (!result.response) { return true }
				if (!result.response.members) { return true }
				console.log(result.response.members)
				for (var i in result.response.members) {
					if (result.response.members[i].user_id == message.user_id &&
						!result.response.members[i].roles.includes("admin")) {
						sender.send("You are not an admin or owner", token, message)
						return true
					}
				}
				var mentions = []
				var loci = []
				for (var i in result.response.members) {
					if (result.response.members[i].muted || text[1] === "all") {
						mentions.push(result.response.members[i].user_id)
						loci.push([0, 6])
					}
				}
				var attachments = [{
					loci: loci,
					user_ids: mentions,
					type: 'mentions'
				}]
				if (mentions.length == 0) {
					sender.send("Nobody has the chat muted", token, message)
					return true
				}
				sender.sendWithAtts(text[0], token, message, attachments)
			})
			return true
		}
		return false
	}
}
