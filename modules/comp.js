const arrays = require('./res/compArray.json');
const regex = /^\/comp(?!ile)\s?/;
const spamRegex = /^(\/comp\s?|\/roast\s?){4,}/;
const sender = require('../sender.js')

exports.mod = class comp {
	constructor() {
		this.name = "comp"
		this.helpString = "/comp [something] will generate a random compliment(?)"
	}

	checkMessage(message, token) {
		if (regex.test(message.text) && !spamRegex.test(message.text)) {
			var toReturn = message.text.substring(5,message.text.length);
			toReturn += " ";
			var randomInt = Math.floor(Math.random() * arrays.firstNounArray.length);
			toReturn += arrays.firstNounArray[randomInt];
			toReturn += ", you ";
			randomInt = Math.floor(Math.random() * arrays.firstAdjectiveArray.length);
			toReturn += arrays.firstAdjectiveArray[randomInt];
			toReturn += " than ";
			randomInt = Math.floor(Math.random() * arrays.secondNounArray.length);
			toReturn += arrays.secondNounArray[randomInt];
			toReturn += ", ";
			randomInt = Math.floor(Math.random() * arrays.secondAdjectiveArray.length);
			toReturn += arrays.secondAdjectiveArray[randomInt];
			toReturn += " ;)";
			sender.send(toReturn, token, message);
			return true;
		}
		return false;
	}
}
