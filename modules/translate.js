const https = require('https')
const translate = require('translate')
const sender = require('../sender.js');

const translateRegex = /^\/translate\s"(.+)"\s(\S+)\s?(\S+)?/i;

exports.mod = class translator {
	constructor() {
		this.helpString = "/translate \"[something]\" [country code] will translate something to a different language, using Yandex (So if results look weird, or like they weren't translated at all, it's their fault, not mine\n"
		this.name = "translate"
	}

	checkMessage(message, token) {
		const yandexKey = require('../res.json').yandex;
		if (translateRegex.test(message.text) && yandexKey) {
			const matches = message.text.match(translateRegex)
			const text = matches[1]
			var fromFlag = 'en'
			var toFlag = matches[2]
			if (matches.length > 3) {
				if (matches[3] != undefined) {
					fromFlag = matches[2]
					toFlag = matches[3]
				}
			}
			try {
				translate(text, { from: fromFlag, to: toFlag, engine: 'yandex', key: yandexKey } ).then((result) => {
					sender.send(result, token, message)
				})
			} catch(err) {
				console.log(err)
				sender.send("Looks like there was an error with your request. Are you sure the to and from fields are okay?", token, message)
			}
			return true
		} else return false
	}
}
