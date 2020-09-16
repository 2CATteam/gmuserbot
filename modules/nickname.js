exports.mod = class nickname {
	constructor(sender) {
		this.name = "Nickname"
		this.helpString = "/nickname [something] will tell me to change my name. Note that this can fail."
		this.sender = sender
	}

	checkMessage(message) {
		if (message.text) {
			const name = message.text.match(/\/nickname\s?(.+)/i)
			if (name && !message.system && message.sender_id !== require('../res.json').user_id) {
				this.sender.like(message)
				if (!message.group_id) {
					this.sender.send("I can only do that in a group chat", message)
					return true;
				}
				this.sender.nickname(name[1], message);
				return true;
			} else {
				return false
			}
		} else return false
	}
}
