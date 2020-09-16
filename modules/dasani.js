const dasaniRegex = /dasani/i;

const ozarkaRegex = /ozarka/i;

const pureLifeRegex = /(pure life)|(nestle)/i;

const aquafinaRegex = /aquafina/i;

const badRegex = /(ozarka)|(pure life)|(nestle)|(smart water)|(fiji)/i;

exports.mod = class dasani {

	constructor(sender) {
		this.name = 'Dasani'
		this.helpString = "If you mention Dasani or some other water brand, I may react!"
		this.sender = sender
	}

	checkMessage(message) {
		if (message.attachments) { if (message.system || message.attachments.length > 0) { return false } }
		var toReturn = ""
		let messageText = message.text;
		if (messageText && (message.sender_id != require('../res.json').user_id)) {
			if (badRegex.test(messageText)) {
				if (dasaniRegex.test(messageText)) {
					toReturn = "Hey, I know you're not trying to be mean or anything, but I don't appreciate you bringing up " + badRegex.exec(messageText)[0] + " and Dasani in the same message...";
				}
				else if (ozarkaRegex.test(messageText)) {
					toReturn = "Ozarka? Really? That's really not even worth mentioning.";
				}
				else if (pureLifeRegex.test(messageText)) {
					toReturn = "UGH DON'T EVEN BRING UP THAT NESTLE WANNABE SLUDGE";
				}
			}
			else if (aquafinaRegex.test(messageText)) {
				toReturn = "Oh, cool, Aquafina! I like that water! It's not as good as Dasani, but, you know, not all water can be perfect.";
			}
			else if (dasaniRegex.test(messageText)) {
				// Check is successful, return a message!
				let randomMessage = Math.random();
				toReturn = 'Did I hear Dasani? I LOVE Dasani!\n\nFun fact about Dasani: ';
				if (randomMessage<.1) {
					toReturn+= 'It\'s by far the best water!';
				}
				else if (randomMessage<.2) {
					toReturn += 'It\'s produced and sold by Coke, the same company that brings you Coca-Cola, Sprite, Smart Water, Minute Maid, and more!';
				}
				else if (randomMessage<.3) {
					toReturn += 'It\'s the #1 water in the world, with the also-good Aquafina in a very close second place!';
				}
				else if (randomMessage<.4) {
					toReturn += 'The tier list for bottled water goes:\n\nDasani\nAquafina\nAny other non-Nestle water\nNestle Pure Life\nOzarka\n\nThis is objective fact, don\'t try to argue it.';
				}
				else if (randomMessage<.5) {
					toReturn += 'It\'s remineralized with Magnesium Sulfate, Potassium Chloride, and salt. While those sound like scary chemicals, they actually help your body digest the water, and keep it from trying to dissolve you! Isn\'t Dasani great?';
				}
				else if (randomMessage<.6) {
					toReturn += 'Dasani bottles are made with up to 30% plant material, and are 100% recyclable! Don\'t you love sustainability?';
				}
				else if (randomMessage<.7) {
					toReturn += 'Dasani generated over a BILLION dollars in sales in 2017!';
				}
				else if (randomMessage<.8) {
					toReturn += 'It just tastes really, really good.';
				}
				else if (randomMessage<.9) {
					toReturn += 'It, combined with all the other bottled water brands, helped bottled water overtake soda as the most sold drink in the US in 2016! Congrats on getting healthier, America!';
				}
				else {
					toReturn += 'While Dasani begins its life as tap water, it goes through reverse osmosis and remineralization to make sure it\'s acting as the best possible drink for its consumers!';
				}
			}
		}
		if (toReturn != "") {
			this.sender.send(toReturn, message);
			return true;
		} else return false;
	}
}
