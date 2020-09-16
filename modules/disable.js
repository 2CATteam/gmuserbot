const fs = require('fs')
const disabled = require('../disabled.json')
const path = require('path')

exports.mod = class disable {
	constructor(sender) {
		this.sender = sender
	}

	checkMessage(message) {
		if (!message.text) {return false}
		var match = message.text.match(/^\/(dis|en)able\s?(.+)/i)
		if (match) {
			if (!message.group_id) {
				this.sender.send("Cannot do that in DMs", message)
				return true
			}
			this.sender.getMembers(message, (result) => {
				if (!result.response) { return true }
				if (!result.response.members) { return true }
				console.log(result.response.members)
				for (var i in result.response.members) {
					if (result.response.members[i].user_id == message.user_id &&
						!result.response.members[i].roles.includes("admin")) {
						this.sender.send("You are not an admin or owner", message)
						return true
					}
				}
				if (!disabled[message.group_id]) {
				disabled[message.group_id] = ["dasani"] }
				if (!disabled.possible.includes(match[2].toLowerCase())) {
					this.sender.send("That's not a module I have", message)
					return true
				}
				if (match[1] === 'dis') {
					disabled[message.group_id].push(match[2].toLowerCase())
				} else {
					disabled[message.group_id] = disabled[message.group_id].filter((value, index, arr) => {
						return !(value === match[2].toLowerCase())
					})
				}
				this.sender.send(`${match[2]} has been ${match[1] === "dis" ? "dis" : "en"}abled for this chat. Use /${match[1] === "dis" ? "en" : "dis"}able ${match[2]} to change it back.`, message)
				fs.writeFileSync(path.join(__dirname, "..", 'disabled.json'), JSON.stringify(disabled, null, "\t"))
			})
			return true
		}
		return false
	}
}
