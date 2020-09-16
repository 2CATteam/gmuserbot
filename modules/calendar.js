const array = require('./res/calendar.json')
const regex = /^\/calendar/i;

exports.mod = class comp {
	constructor(sender) {
		this.name = 'calendar'
		this.helpString = '/calendar will generate a random calendar fact, based on xkcd.com/1930'
		this.sender = sender
	}

	checkMessage(message) {
		if (!message.text) {
			return false
		}
		if (regex.test(message.text)) {
			var toReturn = this.recursiveAdd(array)
			this.sender.send(toReturn, message)
			return true
		} else {return false}
	}

	recursiveAdd(array) {
		if (typeof(array) == "string") {
			return array
		}
		var toReturn = ""
		for (var x in array) {
			if (Array.isArray(array[x])) {
				var index = Math.floor(Math.random() * array[x].length)
				toReturn += this.recursiveAdd(array[x][index])
			} else {
				toReturn += array[x]
			}
		}
		return toReturn
	}
}
