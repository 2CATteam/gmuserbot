const sender = require('../sender.js')
const fs = require('fs')
const disabled = require('../disabled.json')
const path = require('path')

exports.mod = class disable {
	constructor() {
	}

	checkMessage(message, token) {
		if (!message.text) {return false}
		var match = message.text.match(/^\/(dis|en)able\s?(.+)/i)
		if (match) {
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
				if (!disabled[message.group_id]) { disabled[message.group_id] = [] }
				if (!disabled.possible.includes(match[2].toLowerCase())) {
					sender.send("That's not a module I have", token, message)
					return true
				}
				if (match[1] === 'dis') {
					disabled[message.group_id].push(match[2].toLowerCase())
				} else {
					disabled[message.group_id] = disabled[message.group_id].filter((value, index, arr) => {
						return !(value === match[2].toLowerCase())
					})
				}
				sender.send(`${match[2]} has been ${match[1] === "dis" ? "dis" : "en"}abled for this chat. Use /${match[1] === "dis" ? "en" : "dis"}able ${match[2]} to change it back.`, token, message)
				fs.writeFileSync(path.join(__dirname, "..", 'disabled.json'), JSON.stringify(disabled, null, "\t"))
			})
			return true
		}
		return false
	}
}
