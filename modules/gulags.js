const gulagsRegex = /^\/gulag\s?@(.+?)\s?(-?\d+\.?\d*)?\s?$/i;
const pardonRegex = /^\/pardon\s?@(.+?)\s?$/i;
const reportRegex = /^\/report/i;
var fs = require('fs');
var path = require('path');

exports.mod = class glg {
	constructor(sender) {
		this.gulag = require('./res/gulags.json');
		this.name = "Gulags"
		this.helpString = "/gulag @[person] [number] will send a person to the gulags.\n/pardon @[person] will remove them from the gulags.\n/report will tell you how many people are currently in the gulags."
		this.sender = sender
	}

	checkMessage(message) {
		if (gulagsRegex.test(message.text)) {
			if (this.initGulag(message)) this.gulagify(message);
			return true
		}
		else if (pardonRegex.test(message.text)) {
			if (this.initGulag(message)) this.pardon(message);
			return true
		}
		else if (reportRegex.test(message.text)) {
			if (this.initGulag(message)) this.sendReport(message);
			return true
		} else return false
	}

	gulagify(prompt) {
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
		if (this.gulag[prompt.group_id][key]) {
			this.gulag[prompt.group_id][key] = this.gulag[prompt.group_id][key] + num;
		}
		else {
			this.gulag[prompt.group_id][key] = num;
		}
		fs.writeFileSync(path.join(__dirname, 'res', 'gulags.json'), JSON.stringify(this.gulag), 'utf-8');
		var toSend = key;
		toSend += " has been sent to the gulag. They are now serving ";
		toSend += this.gulag[prompt.group_id][key];
		toSend += " lifetimes";
		/*if (prestiges[key] > 0)
		{
			toSend += " in a level ";
			toSend += prestiges[key];
			toSend += " gulag";
		}*/
		toSend += "!";
		console.log(this.gulag);
		this.sender.send(toSend, prompt);
	}

	pardon(prompt) {
		let message = prompt.text;
		var key = message.match(pardonRegex)[1].trim();
		if (this.gulag[prompt.group_id][key]) {
			this.gulag[prompt.group_id][key] = 0;
			fs.writeFileSync(path.join(__dirname, 'res', 'gulags.json'), JSON.stringify(this.gulag), 'utf-8');
			this.sender.send(key + " has been graciously pardoned!", prompt);
		}
		else {
			this.sender.send(key + " is not in the gulag!", prompt);
		}
	}

	sendReport(prompt) {
		var toSend = "Lifetimes in Gulag: \n\n";
		for (var person in this.gulag[prompt.group_id]) {
			if (person && this.gulag[prompt.group_id][person] > 0) {
				toSend += person;
				toSend += ": ";
				toSend += this.gulag[prompt.group_id][person];
				toSend += "\n";
			}
		}
		if (toSend.length > 25) {
			this.sender.send(toSend, prompt);
		}
		else {
			this.sender.send("The gulags are empty, Comrade!", prompt);
		}
	}

	initGulag(prompt) {
		if (prompt.group_id) {
			if (this.gulag[prompt.group_id] === undefined) {
				this.gulag[prompt.group_id] = {}
			}
			return true
		} else {
			this.sender.send("You have to do /gulag commands in a chat, not just a DM", prompt)
			return false
		}
	}
}
