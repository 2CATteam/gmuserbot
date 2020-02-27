//var disabled = require('./res/disabled.json')
const sender = require('../sender.js')
const fs = require('fs')
const https = require('https')

exports.mod = class atev {
	constructor() {
		this.name = '@muted'
		this.helpString = '@muted will do an @ mention for everyone who has this chat muted. To reduce spam, only owners and admins can use this.'
	}

	checkMessage(message, token) {
		if (!message.text) {return false}
		if (message.text.match(/^@muted/i) && (message.sender_id != require('../res.json').user_id)) {
			if (!message.group_id) {
				sender.send("Cannot do that in DMs", token, message)
				return true
			}
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
					if (result.response.members[i].muted) {
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
				sender.sendWithAtts("@muted", token, message, attachments)
			})
			return true
		}
		return false
	}
}