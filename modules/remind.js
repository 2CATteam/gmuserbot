const reminderRegex = /^\/remind\s?Me\s(?:to\s)?(.+)\sin\s/i
var scheduler = require('node-schedule');
const scheduled = require('./res/reminders.json')
const fs = require('fs')

exports.mod = class comp {
	constructor(sender) {
		this.name = 'Remind'
		this.helpString = '/remindme [something] in x days, y seconds, etc... will do exactly what you would expect it to.'
		this.messages = []
		for (var i in scheduled.jobs) {
			const date = new Date(scheduled.jobs[i].time)
			if (date > new Date()) {
				this.scheduleMessage(date, scheduled.jobs[i].text, scheduled.jobs[i].token, scheduled.jobs[i].message)
			}
		}
		this.sender = sender
	}

	checkMessage(message, token) {
		if (reminderRegex.test(message.text) && (message.sender_id != require('../res.json').user_id)) {
			this.scheduleMessageFromMessage(message, token)
			return true
		}
		return false
	}

	scheduleMessage(date, text, token, message) {
		scheduler.scheduleJob(date, function(senderA, textA, tokenA, messageA) {
			senderA.send(textA, messageA)
		}.bind(null, this.sender, text, token, message))
		this.messages.push({ time: date, text: text, token: token, message: message })
		fs.writeFileSync(__dirname + '/res/reminders.json', JSON.stringify({jobs: this.messages}, null, "\t"), 'utf8')
	}

	scheduleMessageFromMessage(message, token) {
		var date = new Date()
		const secondsOffset = message.text.match(/(\d+)\sseconds?/i)
		if (secondsOffset) {
			date.setSeconds(date.getSeconds() + parseInt(secondsOffset[1]))
		}
		const minutesOffset = message.text.match(/(\d+)\sminutes?/i)
		if (minutesOffset) {
			date.setMinutes(date.getMinutes() + parseInt(minutesOffset[1]))
		}
		const hoursOffset = message.text.match(/(\d+)\shours?/i)
		if (hoursOffset) {
			date.setHours(date.getHours() + parseInt(hoursOffset[1]))
		}
		const daysOffset = message.text.match(/(\d+)\sdays?/i)
		if (daysOffset) {
			date.setDate(date.getDate() + parseInt(daysOffset[1]))
		}
		const weeksOffset = message.text.match(/(\d+)\sweeks?/i)
		if (weeksOffset) {
			date.setDate(date.getDate() + 7 * parseInt(weeksOffset[1]))
		}
		const monthsOffset = message.text.match(/(\d+)\smonths?/i)
		if (monthsOffset) {
			date.setMonth(date.getMonth() + parseInt(monthsOffset[1]))
		}
		const yearsOffset = message.text.match(/(\d+)\syears?/i)
		if (yearsOffset) {
			date.setFullYear(date.getFullYear() + parseInt(yearsOffset[1]))
			message.channel.send("Please don't trust this reminder, a year is a long time and this bot is barely running as-is")
		}
		var text = message.text.match(reminderRegex)[1]
		console.log(text)
		this.scheduleMessage(date, text, token, message)
		this.sender.like(message)
		this.sender.send(`I will remind you of this:\n${text}\nOn this date:\n${date}`, message)
	}
}
