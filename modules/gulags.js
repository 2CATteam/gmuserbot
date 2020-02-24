const gulagsRegex = /^\/gulag\s?@(.+?)\s?(-?\d+\.?\d*)?\s?$/i;
const pardonRegex = /^\/pardon\s?@(.+?)\s?$/i;
const reportRegex = /^\/report/i;
var fs = require('fs');
var path = require('path');
const sender = require('../sender.js');

exports.mod = class glg {
	constructor() {
		this.gulag = require('./res/gulags.json');
		this.name = "gulags"
		this.helpString = "/gulag @[person] [number] will send a person to the gulags.\n/pardon @[person] will remove them from the gulags.\n/report will tell you how many people are currently in the gulags."
	}

	checkMessage(message, token) {
		if (gulagsRegex.test(message.text)) {
			this.gulagify(message, token);
			return true
		}
		else if (pardonRegex.test(message.text)) {
			this.pardon(message, token);
			return true
		}
		else if (reportRegex.test(message.text)) {
			this.sendReport(token);
			return true
		} else return false
	}

	gulagify(prompt, token) {
		var message = prompt.text;
		var key = message.match(gulagsRegex)[1].trim();
		var num = 1;
		console.log("Gulag info:");
		console.log(message);
		if (message.match(gulagsRegex)[2]) {
			console.log(message.match(gulagsRegex)[2]);
			num = parseFloat(message.match(gulagsRegex)[2]);
			console.log(num);
		}
		console.log(key);
		if (this.gulag[key]) {
			this.gulag[key] = this.gulag[key] + num;
		}
		else {
			this.gulag[key] = num;
		}
		fs.writeFileSync(path.join(__dirname, 'res', 'gulags.json'), JSON.stringify(this.gulag), 'utf-8');
		var toSend = key;
		toSend += " has been sent to the gulag. They are now serving ";
		toSend += this.gulag[key];
		toSend += " lifetimes";
		/*if (prestiges[key] > 0)
		{
			toSend += " in a level ";
			toSend += prestiges[key];
			toSend += " gulag";
		}*/
		toSend += "!";
		console.log(this.gulag);
		sender.send(toSend, token, prompt);
	}

	pardon(prompt, token) {
		let message = prompt.text;
		var key = message.match(pardonRegex)[1].trim();
		if (this.gulag[key]) {
			this.gulag[key] = 0;
			fs.writeFileSync(path.join(__dirname, 'res', 'gulags.json'), JSON.stringify(this.gulag), 'utf-8');
			sender.send(key + " has been graciously pardoned!", token, prompt);
		}
		else {
			sender.send(key + " is not in the gulag!", token, prompt);
		}
	}

	sendReport(token) {
		var toSend = "Lifetimes in Gulag: \n\n";
		for (var person in this.gulag) {
			if (person && this.gulag[person] > 0) {
				toSend += person;
				toSend += ": ";
				toSend += this.gulag[person];
				toSend += "\n";
			}
		}
		if (toSend.length > 25) {
			sender.send(toSend, token, prompt);
		}
		else {
			sender.send("The gulags are empty, Comrade!", token, prompt);
		}
	}
}
