const gameRegex = /^\/chameleon/i
const statics = require('./res/game.json')

exports.mod = class game {
	constructor(sender) {
		this.helpString = "/chameleon will start a game based on The Chameleon tabletop game. The rules will be explained when you start."
		this.name = "Cham"
		this.games = {}
		this.sender = sender
	}

	checkMessage(message, token) {
		if (!message.text) return false
		//Initialize game when told to
		if (message.text.match(gameRegex)) {
			if (!message.group_id) {
				this.sender.send("This command must be done in a group", message)
			} else {
				this.sender.send(statics.start, message)
				this.games[message.group_id] = {
					players: {},
					round: 0,
					cham: null,
					queue: []
				}
			}
			return true
		//Handle players joining
		} else if (message.text.match(/^join/i) && this.games[message.group_id] && this.games[message.group_id].round == 0) {
			this.games[message.group_id].players[message.user_id] = {
				score: 0,
				name: message.name
			}
			if (message.user_id != "82834756" && !this.games[message.group_id].queue.includes(message.user_id)) {
				this.games[message.group_id].queue.push(message.user_id)
			}
			this.sender.like(message)
			return true
		//Start rounds
		} else if (this.games[message.group_id] &&
			(message.text.match(/^\/start/i) && this.games[message.group_id].round == 0
			|| message.text.match(/^\/next/i) && this.games[message.group_id].round != 0)) {
			this.startRound(message, token)
			return true
		//Handle accusations
		} else if (this.games[message.group_id] && this.games[message.group_id].players[message.user_id] && message.attachments.length > 0 && this.games[message.group_id].round > 0) {
			for (var x in message.attachments) {
				if (message.attachments[x].type == "mentions" && message.attachments[x].user_ids.length == 1) {
					this.games[message.group_id].players[message.user_id].accusing = message.attachments[x].user_ids[0]
					this.sender.like(message)
				}
			}
			return true
		}
		return false
	}

	startRound(message, token) {
		if (this.games[message.group_id].round > 0) {
			//Handle telling if they were right or wrong
			//Count out accusations
			var accused = {}
			for (var x in this.games[message.group_id].players) {
				if (this.games[message.group_id].players[x].accusing) {
					//Add accusation stuff
					if (!accused[this.games[message.group_id].players[x].accusing]) {
						accused[this.games[message.group_id].players[x].accusing] = 0
					}
					accused[this.games[message.group_id].players[x].accusing] += 1
					//If they were right, add a point
					if (this.games[message.group_id].players[x].accusing == this.games[message.group_id].cham) {
						this.games[message.group_id].players[x].score += 1
					}
				}
			}
			//Calculate the most accused person
			var max = 0
			var most = ""
			for (var x in accused) {
				if (accused[x] > max) {
					max = accused[x]
					most = x
				} else if (accused[x] == max) {
					most = ""
				}
			}
			//Check if they were right
			var right = false
			if (most == this.games[message.group_id].cham) {
				right = true
			}
			//Put the name in of the most accused player
			if (most && this.games[message.group_id].players[most]) {
				most = this.games[message.group_id].players[most].name
			} else {
				most = "nobody"
			}
			//Send the status and scores
			var toSend = `The person most accused was ${most}. They were${right ? "" : " not"} the Chameleon!`
			//If they were wrong, give the Cham 3 points and tell them who it was
			if (!right) {
				this.games[message.group_id].players[this.games[message.group_id].cham].score += 3
				toSend += ` The Chameleon was actually ${this.games[message.group_id].players[this.games[message.group_id].cham].name}.`
			}
			toSend += ` The coordinates of the secret word were ${this.games[message.group_id].coord}.`
			this.showScores(toSend, message, token)
		}
		//Increment the round number
		this.games[message.group_id].round += 1

		//Delete and end if we're done
		if (this.games[message.group_id].round == 6) {
			delete this.games[message.group_id]
			return
		}

		//Choose the chameleon (Including the chance for none)
		var keys = Object.keys(this.games[message.group_id].players)
		var index = (((keys.length) * Math.random()) << 0)
                this.games[message.group_id].cham = keys[index]

		//Choose the coordinates
		var letters = "ABCD"
		var coord = ""
		coord += letters[(4 * Math.random()) << 0]
		coord += ((4 * Math.random()) << 0) + 1

		this.games[message.group_id].coord = coord

		//Message everyone
		for (var x in this.games[message.group_id].players) {
			let fakeMessage = {}
			Object.assign(fakeMessage, message)
			delete fakeMessage.group_id
			fakeMessage.chat_id = x
			fakeMessage.sender_id = x
			if (x == this.games[message.group_id].cham || message.text.includes("‎")) {
				this.sender.send("You're the Chameleon. Good luck.", fakeMessage)
			} else {
				this.sender.send(`The secret phrase is at position ${coord}. Good luck.`, fakeMessage)
			}
		}

		//Clear accusations
		for (var x in this.games[message.group_id].players) {
			this.games[message.group_id].players[x].accusing = null
		}

		//Explain queue
		var toAdd = ""
		for (var x in this.games[message.group_id].queue) {
			console.log("Initial")
			var index = parseInt(x)
			console.log(index)
			index += this.games[message.group_id].round
			console.log(index)
			index = index % this.games[message.group_id].queue.length
			console.log(index)
			toAdd += this.games[message.group_id].players[this.games[message.group_id].queue[index]].name
			if (x < this.games[message.group_id].queue.length - 1) {
				toAdd += ", "
			}
		}

		//Send message with game board
		setTimeout(() => {this.sender.sendImage(statics.round + toAdd, statics.boards[(Math.random() * statics.boards.length) << 0], message)}, 1000)
	}

	showScores(toSend, message, token) {
		toSend += " Here are the current scores:\n\n"
		for (var x in this.games[message.group_id].players) {
			toSend += this.games[message.group_id].players[x].name
			toSend += ": "
			toSend += this.games[message.group_id].players[x].score
			toSend += "\n"
		}
		if (this.games[message.group_id].round == 5) {
			toSend += statics.end
		} else {
			toSend += "On to the next round!"
		}
		this.sender.send(toSend, message)
	}
}
