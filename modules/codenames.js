const statics = require('./res/codenames.json')
const Jimp = require('jimp')
const fs = require('fs')
var path = require('path')

exports.mod = class codenames {
	constructor(sender) {
		this.helpString = "/codenames will start a game based on the Codenames tabletop game. The rules are kinda complex, so just Google it if you don't know how to play."
		this.name = "Codenames"
		this.games = {}
		this.sender = sender
	}

	checkMessage(message) {
		if (!message.text) return false
		if (message.text.match(/^\/codename/i)) {
			this.initializeGame(message)
			return true
		}
		if (message.text.match(/^\/start/i) && this.games[message.group_id]) {
			this.startGame(message)
			return true
		}
		if (this.games[message.group_id] && this.games[message.group_id].started) {
			this.clueCheck(message)
		}
		if (message.text.match(/^\/pass/i) && this.games[message.group_id] && this.games[message.group_id].started) {
			if (this.games[message.group_id].next == "blue" && this.games[message.group_id].red.includes(message.user_id)) {
				this.next(message)
			} else if (this.games[message.group_id].next == "red" && this.games[message.group_id].blue.includes(message.user_id)) {
				this.next(message)
			}
			return true
		}
		if (message.text.match(/^\/guess [A-Ea-e][1-5]/i) && this.games[message.group_id] && this.games[message.group_id].started) {
			console.log("Should run")
			this.guessCheck(message)
			return true
		}
		if (message.text.match(/^"?(red\s?lead|blue\s?lead|red|blue|random)"?$/i) && this.games[message.group_id] && !this.games[message.group_id].started) {
			this.teamJoin(message)
			return true
		}
		//TODO: If exists but not started, check for the group members
	}

	async startGame(message) {
		while (this.games[message.group_id].rand.length > 0) {
			var index = Math.floor(Math.random() * this.games[message.group_id].rand.length)
			if (this.games[message.group_id].red.length > this.games[message.group_id].blue.length) {
				this.games[message.group_id].blue.push(this.games[message.group_id].rand[index])
			} else if (this.games[message.group_id].red.length < this.games[message.group_id].blue.length || Math.random() > 0.5) {
				this.games[message.group_id].red.push(this.games[message.group_id].rand[index])
			} else {
				this.games[message.group_id].blue.push(this.games[message.group_id].rand[index])
			}
			this.games[message.group_id].rand.splice(index, 1)
		}

		if (!this.games[message.group_id].redLead) {
			if (this.games[message.group_id].red.length < 2) {
				this.sender.send("It looks like the red team doesn't have enough people to play. We need at least one spymaster and at least one person on the team.", message)
				return
			}
			this.games[message.group_id].redLead = this.games[message.group_id].red.splice(0, 1)[0]
		}

		if (!this.games[message.group_id].blueLead) {
			if (this.games[message.group_id].blue.length < 2) {
				this.sender.send("It looks like the blue team doesn't have enough people to play. We need at least one spymaster and at least one person on the team.", message)
				return
			}
			this.games[message.group_id].blueLead = this.games[message.group_id].blue.splice(0, 1)[0]
		}

		var base = await Jimp.read(path.join(__dirname, '/res/template.png'))
		var font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK)
		var red = await new Jimp(290, 170, 0xff1c1cff)
		var blue = await new Jimp(290, 170, 0x5252ffff)
		var blk = await new Jimp(290, 170, 0x808080ff)
		var ylw = await new Jimp(290, 170, 0xc0c069ff)
		var secret = base.clone()
		var notSecret = base.clone()

		for (var x in this.games[message.group_id].words) {
			switch(this.games[message.group_id].board[x]) {
				case "red":
					secret.composite(red, 100 + ((x % 5) * 300), 150 + Math.floor(x / 5) * 180)
					break
				case "blue":
					secret.composite(blue, 100 + ((x % 5) * 300), 150 + Math.floor(x / 5) * 180)
					break
				case "black":
					secret.composite(blk, 100 + ((x % 5) * 300), 150 + Math.floor(x / 5) * 180)
					break
				case "yellow":
					secret.composite(ylw, 100 + ((x % 5) * 300), 150 + Math.floor(x / 5) * 180)
					break
			}
			await secret.print(font, 100 + (x % 5) * 300, 150 + Math.floor(x / 5) * 180,
				{text: this.games[message.group_id].words[x], alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER, alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE}, 290, 170)
			await notSecret.print(font, 100 + (x % 5) * 300, 150 + Math.floor(x / 5) * 180,
				{text: this.games[message.group_id].words[x], alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER, alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE}, 290, 170)
		}
		await secret.write(path.join(__dirname, `./res/${message.group_id}secret.png`))
		await notSecret.write(path.join(__dirname, `./res/${message.group_id}public.png`))

		await this.sleep(1000)

		this.games[message.group_id].private_url = await this.sender.uploadImage(path.join(__dirname, `res/${message.group_id}secret.png`))

		var redMessage = {}
		Object.assign(redMessage, message)
		delete redMessage.group_id
		redMessage.chat_id = this.games[message.group_id].redLead.id
		redMessage.sender_id = this.games[message.group_id].redLead.id
		this.sender.sendImage("Here's the board you'll be using this round. Remember, don't say anything other than your clues, which should be given in the form \"word: number\".", this.games[message.group_id].private_url, redMessage)

		var blueMessage = {}
		Object.assign(blueMessage, message)
		delete blueMessage.group_id
		blueMessage.chat_id = this.games[message.group_id].blueLead.id
		blueMessage.sender_id = this.games[message.group_id].blueLead.id
		this.sender.sendImage("Here's the board you'll be using this round. Remember, don't say anything other than your clues, which should be given in the form \"word: number\".", this.games[message.group_id].private_url, blueMessage)


		var toSend = 'Here\'s the board we\'ll be using this game. Team spymasters, give clues of the form "clue: number". Team members, once you\'re ready to guess the answer, guess with "/guess A1", with A1 obviously replaced with the coordinates of what you want to guess. If you want to skip to the next round, type "/pass". The teams for this game look like this:\n\n'

		toSend += `Red spymaster: ${this.games[message.group_id].redLead.name}`
		toSend += "\n"
		toSend += `Blue spymaster: ${this.games[message.group_id].blueLead.name}`

		toSend += "\n\nRed team:\n"
		for (var x in this.games[message.group_id].redNames) {
			toSend += this.games[message.group_id].redNames[x]
			toSend += "\n"
		}

		toSend += "\nBlue team:\n"
		for (var x in this.games[message.group_id].blueNames) {
			toSend += this.games[message.group_id].blueNames[x]
			toSend += "\n"
		}

		var url = await this.sender.uploadImage(path.join(__dirname, `./res/${message.group_id}public.png`))
		await this.sender.sendImage(toSend, url, message)
		this.games[message.group_id].started = true
		this.next(message)
	}

	initializeGame(message) {
		this.games[message.group_id] = {
			blue: [],
			blueNames: [],
			red: [],
			redNames: [],
			rand: [],
			redLead: "",
			blueLead: "",
			next: "",
			guessesLeft: 0,
			board: [],
			words: [],
			waiting: false,
			started: false
		}
		this.sender.send(`Please choose your teams by responding:
"Red lead" for the red leader.
"Red" for red team member
"Blue lead" for the blue leader.
"Blue" blue team member.
"Random" if you want to be randomly assigned to a team.

Once everyone has chosen, please type /start to begin.`, message)

		var firstMove = Math.floor(Math.random() * 2)
		if (firstMove == 0) {
			this.games[message.group_id].next = "red"
		}
		else {
			this.games[message.group_id].next = "blue"
		}

		for(var i =  0; i < 25; i++) {
			var random = Math.floor(Math.random() * statics.length)
			if (this.games[message.group_id].words.includes(statics[random])) {
				i--
				continue
			} else {
				this.games[message.group_id].words.push(statics[random])
			}
		}

		for(var j = 0; j < 25; j++) {
			this.games[message.group_id].board.push("yellow")
		}

		for(var addRed = 0; addRed < (this.games[message.group_id].next == "red" ? 9 : 8); addRed++) {
			var randomBoard = Math.floor(Math.random() * 25)
			if(this.games[message.group_id].board[randomBoard] == "yellow") {
				this.games[message.group_id].board[randomBoard] = "red"
			} else {
				addRed--
				continue
			}
		}

		for(var addBlue = 0; addBlue < (this.games[message.group_id].next == "red" ? 8 : 9); addBlue++) {
			var randomBoard = Math.floor(Math.random() * 25)
			if(this.games[message.group_id].board[randomBoard] == "yellow") {
				this.games[message.group_id].board[randomBoard] = "blue"
			}
			else {
				addBlue--
				continue
			}
		}

		while(true) {
			var randomBoard = Math.floor(Math.random() * 25)
			if(this.games[message.group_id].board[randomBoard] == "yellow") {
				this.games[message.group_id].board[randomBoard] = "black"
				break
			}
		}
	}

	clueCheck(message){
		let re = /^(\w+):\s(\d+)$/
		if (message.user_id != this.games[message.group_id].redLead.id && message.user_id != this.games[message.group_id].blueLead.id) return
		if (this.games[message.group_id].waiting) {
			if (message.text.match(re)) {
				let word = message.text.match(re)
				if (this.games[message.group_id].next == "red" && message.user_id == this.games[message.group_id].blueLead.id
				|| this.games[message.group_id].next == "blue" && message.user_id == this.games[message.group_id].redLead.id) {
					this.games[message.group_id].waiting = false
					this.games[message.group_id].guessesLeft = parseInt(word[2]) + 1
				}
			} else {
				this.sender.send('If that was meant to be a clue, I couldn\'t understand it.\n\nRemember, you need to structure your clue as "word: number"', message)
			}
		}
	}

	next(message){
		this.sender.send(`Hey ${this.games[message.group_id].next == "red" ? this.games[message.group_id].redLead.name : this.games[message.group_id].blueLead.name}, it's your turn to give a clue`, message)
		if (this.games[message.group_id].next == 'blue') {
			this.games[message.group_id].next = 'red';
		}
		else this.games[message.group_id].next = 'blue'
		this.games[message.group_id].waiting = true
		this.games[message.group_id].guessesLeft = 0
	}

	end(message) {
		fs.unlinkSync(path.join(__dirname, `./res/${message.group_id}public.png`))
		fs.unlinkSync(path.join(__dirname, `./res/${message.group_id}secret.png`))
		delete this.games[message.group_id]
	}

	async guessCheck(message) {
		console.log("Check")
		if (this.games[message.group_id].waiting) {
			this.sender.send("You can't guess until the team lead gives a hint, idiot", message)
			return
		}
		if (this.games[message.group_id].next == "red") {
			if (!this.games[message.group_id].blue.includes(message.user_id)) {
				this.sender.send("Bro, chill, it's not your team's turn", message)
				return
			}
		} else {
			if (!this.games[message.group_id].red.includes(message.user_id)) {
				this.sender.send("Bro, chill, it's not your team's turn", message)
				return
			}
		}

		var coordinates = message.text.match(/([A-Ea-e])([1-5])/i)
		var index = ((parseInt(coordinates[2]) - 1) * 5)
		switch(coordinates[1].toUpperCase()) {
			case "E":
				index += 1
			case "D":
				index += 1
			case "C":
				index += 1
			case "B":
				index += 1
		}

		console.log("Coordinates", index)

		if (!this.games[message.group_id].board[index]) {
			this.sender.send("You already guessed that one. You absolute buffoon.", message)
			return
		}

		var base = await Jimp.read(path.join(__dirname, `./res/${message.group_id}public.png`))
		var font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK)

		var red = await new Jimp(290, 170, 0xff1c1cff)
		var blue = await new Jimp(290, 170, 0x5252ffff)
		var blk = await new Jimp(290, 170, 0x808080ff)
		var ylw = await new Jimp(290, 170, 0xc0c069ff)

		var toSend = ""

		switch(this.games[message.group_id].board[index]) {
			case "red":
				base.composite(red, 100 + ((index % 5) * 300), 150 + Math.floor(index / 5) * 180)
				toSend = "You guessed a red tile!"
				break
			case "blue":
				base.composite(blue, 100 + ((index % 5) * 300), 150 + Math.floor(index / 5) * 180)
				toSend = "You guessed a blue tile!"
				break
			case "yellow":
				base.composite(ylw, 100 + ((index % 5) * 300), 150 + Math.floor(index / 5) * 180)
				toSend = "You guessed a civilian!"
				break
			case "black":
				base.composite(blk, 100 + ((index % 5) * 300), 150 + Math.floor(index / 5) * 180)
				toSend = "You guessed the assassin!"
				break
		}
		await base.print(font, 100 + (index % 5) * 300, 150 + Math.floor(index / 5) * 180,
				{text: this.games[message.group_id].words[index], alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER, alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE}, 290, 170)

		await base.write(path.join(__dirname, `./res/${message.group_id}public.png`))

		var toTest = this.games[message.group_id].board[index]

		this.games[message.group_id].board[index] = ""

		//OOF
		console.log("Oof point")
		if (!this.games[message.group_id].board.includes("red")) {
			await this.sender.sendImage(toSend, this.games[message.group_id].private_url, message)
			await this.sender.send("RED TEAM WINS! Congratulations!🥳🎉🎈🎊🥳", message)
			this.end(message)
			return
		}

		if (!this.games[message.group_id].board.includes("blue")) {
			await this.sender.sendImage(toSend, this.games[message.group_id].private_url, message)
			await this.sender.send("BLUE TEAM WINS! Congratulations!🥳🎉🎈🎊🥳", message)
			this.end(message)
			return
		}

		if (toTest == this.games[message.group_id].next || toTest == "yellow") {
			toSend += " As such, your turn has ended."
			await this.sleep(1000)
			var url = await this.sender.uploadImage(path.join(__dirname, `./res/${message.group_id}public.png`))
			this.sender.sendImage(toSend, url, message)
			this.next(message)
			return
		} else if (toTest == "black") {
			toSend += " As such, the game has ended with you as the loser."
			await this.sender.sendImage(toSend, this.games[message.group_id].private_url, message)
			await this.sender.send(`${this.games[message.group_id].next.toUpperCase()} TEAM WINS! Congratulations!🥳🎉🎈🎊🥳`, message)
			this.end(message)
			return
		} else {
			toSend += ` Good job! You have ${--(this.games[message.group_id].guessesLeft)} guesses left!`
			await this.sleep(1000)
			var url = await this.sender.uploadImage(path.join(__dirname, `./res/${message.group_id}public.png`))
			await this.sender.sendImage(toSend, url, message)
			if (this.games[message.group_id].guessesLeft == 0) {
				this.next(message)
			}
		}
	}

	teamJoin(message) {
		var match = message.text.match(/^"?(red\s?lead|blue\s?lead|red|blue|random)"?$/i)
		if (message.text.match(/red\s?lead/i)) {
			if (this.games[message.group_id].redLead == "") {
				this.games[message.group_id].redLead = {
					name: message.name,
					id: message.user_id
				}
				this.sender.like(message)
			}
		} else if (message.text.match(/blue\s?lead/i)) {
			if (this.games[message.group_id].blueLead == "") {
				this.games[message.group_id].blueLead = {
					name: message.name,
					id: message.user_id
				}
				this.sender.like(message)
			}
		} else if (message.text.match(/red/i)) {
			if (!this.games[message.group_id].red.includes(message.user_id)) {
				this.games[message.group_id].red.push(message.user_id)
				this.games[message.group_id].redNames.push(message.name)
				this.sender.like(message)
			}
		} else if (message.text.match(/blue/i)) {
			if (!this.games[message.group_id].blue.includes(message.user_id)) {
				this.games[message.group_id].blue.push(message.user_id)
				this.games[message.group_id].blueNames.push(message.name)
				this.sender.like(message)
			}
		} else {
			if (!this.games[message.group_id].rand.includes(user.id)
				&& !this.games[message.group_id].red.includes(user.id)
				&& !this.games[message.group_id].blue.includes(user.id)) {
				this.games[message.group_id].rand.push(user.id)
				this.sender.like(message)
			}
		}
	}

	async sleep(mills) {
		return new Promise((resolve, reject) => {
			setTimeout(() => { resolve() }, mills)
		})
	}
/*
				switch(r.emoji.name) {
					case():
						if (this.games[message.group_id].redLead == "") {
							this.games[message.group_id].redLead = user.id
						} else {
							r.users.remove(user.id)
						}
						break
					case():
						if (!this.games[message.group_id].red.includes(user.id)) {
							this.games[message.group_id].red.push(user.id)
						}
						break
					case():
						if (this.games[message.group_id].blueLead == "") {
							this.games[message.group_id].blueLead = user.id
						} else {
							r.users.remove(user.id)
						}
						break
					case():
						if (!this.games[message.group_id].blue.includes(user.id)) {
							this.games[message.group_id].blue.push(user.id)
						}
						break
					case():
						if (!this.games[message.group_id].rand.includes(user.id)
							&& !this.games[message.group_id].red.includes(user.id)
							&& !this.games[message.group_id].blue.includes(user.id)) {
							this.games[message.group_id].rand.push(user.id)
						} else {
							r.users.remove(user.id)
						}
						break
*/
}
