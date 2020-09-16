const egg = /^\/egg/ig;
const eggs = require('./res/paths.json').paths

exports.mod = class egggggggggg {
	constructor(eg) {
		this.helpString = "/egg"
		this.name = "Egg"
		this.eg = eg
	}

	checkMessage(eggg) {
		if (!egg.test(eggg.text)) { return false }
		let egggg = Math.floor(Math.random() * eggs.length);
		this.eg.sendImage("egg", eggs[egggg], eggg)
		return true
	}
}
