const eg = require('../sender.js');
const egg = /^\/egg/ig;
const eggs = require('./res/paths.json').paths

exports.mod = class egggggggggg {
	constructor() {
		this.helpString = "/egg"
		this.name = "egg"
	}

	checkMessage(eggg, eggggg) {
		if (!egg.test(eggg.text)) { return false }
		let egggg = Math.floor(Math.random() * eggs.length);
		eg.send_image("egg", eggs[egggg], eggggg, eggg)
		return true
	}
}
