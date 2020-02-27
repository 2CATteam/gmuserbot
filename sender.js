const https = require('https')

exports.send = function sendMessage(toSend, token, message) {
	if (toSend.length > 1000) {
		for (var i = 0; i < toSend.length / 1000; i++) {
			setTimeout(function(i, token, message) {
				sendMessage(toSend.substring(1000 * i, 1000*(i+1)), token, message)
			}.bind(null, i, token, message), i * 500)
		}
		return;
	}
	//Creates some options to let the message be sent with the GroupMe API
	var options = {
		hostname: 'api.groupme.com',
		path: `/v3/groups/${message.group_id}/messages?token=${token}`,
		method: 'POST',
		headers: {
			'Content-Type': "application/json"
		}
	}
	var guid = new Date().getTime().toString() + message.group_id
	var body = {
		"message": {
			"source_guid": guid,
			"text": toSend,
			"attachments": []
		}
	}
	if (message.chat_id) {
		guid = new Date().getTime().toString() + message.chat_id.toString()
		options = {
			hostname: 'api.groupme.com',
			path: `/v3/direct_messages?token=${token}`,
			method: 'POST',
			headers: {
				'Content-Type': "application/json"
			}
		}
		body = {
			"message": {
				"source_guid": guid,
				"text": toSend,
				"recipient_id": message.sender_id,
				"attachments": []
			}
		}
	}
	//Creates the request to send the request
	let req = https.request(options,  (response) => {
		console.log(`Status: ${response.statusCode}`);
		response.setEncoding('utf8');
		response.on('data', (chunk) => {
			console.log(`Body: ${chunk}`);
		})
		response.on('end', () => {
			console.log("End of conversation.");
		})
	});
	//Logs errors and sends the request
	req.on('error', (e) => {console.error(`Problem: ${e.message}`)});
	req.end(JSON.stringify(body));
}

exports.send_image = function send(toSend, image, token, message) {
	//Creates some options to let the message be sent with the GroupMe API
	var options = {
		hostname: 'api.groupme.com',
		path: `/v3/groups/${message.group_id}/messages?token=${token}`,
		method: 'POST',
		headers: {
			'Content-Type': "application/json"
		}
	}
	var guid = new Date().getTime().toString() + message.group_id
	var body = {
		"message": {
			"source_guid": guid,
			"text": toSend,
			"attachments": [
				{
					"type": "image",
					"url": image
				}
			]
		}
	}
	if (message.chat_id) {
		guid = new Date().getTime().toString() + message.chat_id.toString()
		options = {
			hostname: 'api.groupme.com',
			path: `/v3/direct_messages?token=${token}`,
			method: 'POST',
			headers: {
				'Content-Type': "application/json"
			}
		}
		body = {
			"message": {
				"source_guid": guid,
				"text": toSend,
				"recipient_id": message.sender_id,
				"attachments": [{
					"type": "image",
					"url": image
				}]
			}
		}
	}
	//Creates the request to send the request
	let req = https.request(options,  (response) => {
		console.log(`Status: ${response.statusCode}`);
		response.setEncoding('utf8');
		/*response.on('data', (chunk) => {
			console.log(`Body: ${chunk}`);
		})
		response.on('end', () => {
			console.log("End of conversation.");
		})*/
	});
	//Logs errors and sends the request
	req.on('error', (e) => {console.error(`Problem: ${e.message}`)});
	req.end(JSON.stringify(body));
};

exports.like = function like(message, token) {
	options = {
		hostname: 'api.groupme.com',
		path: `/v3/messages/${message.chat_id ? message.chat_id : message.group_id}/${message.id}/like?token=${token}`,
		method: 'POST',
		headers: {
			'Content-Type': "application/json"
		}
	}
	//Creates the request to send the request
	let req = https.request(options,  (response) => {
		console.log(`Status: ${response.statusCode}`);
		response.setEncoding('utf8');
		response.on('data', (chunk) => {
			console.log(`Body: ${chunk}`);
		})
		response.on('end', () => {
			console.log("End of conversation.");
		})
	});
	//Logs errors and sends the request
	req.on('error', (e) => {console.error(`Problem: ${e.message}`)});
	req.end();
}

exports.nickname = function nickname(name, token, message) {
	var body = {
		"membership": {
			"nickname": `${name}`
		}
	}
	var options = {
		hostname: 'api.groupme.com',
		path: `/v3/groups/${message.group_id}/memberships/update?token=${token}`,
		method: 'POST',
		headers: {
			'Content-Type': "application/json"
		}
	}
	console.log(body)
	console.log(options)
	//Creates the request to send the request
	let req = https.request(options,  (response) => {
		console.log(`Status: ${response.statusCode}`);
		response.setEncoding('utf8');
		response.on('data', (chunk) => {
			console.log(`Body: ${chunk}`);
		})
		response.on('end', () => {
			console.log("End of conversation.");
		})
	});
	//Logs errors and sends the request
	req.on('error', (e) => {console.error(`Problem: ${e.message}`)});
	req.end(JSON.stringify(body));
}

exports.sendWithAtts = function sendMessageWithAtts(toSend, token, message, attachments) {
	//Creates some options to let the message be sent with the GroupMe API
	var options = {
		hostname: 'api.groupme.com',
		path: `/v3/groups/${message.group_id}/messages?token=${token}`,
		method: 'POST',
		headers: {
			'Content-Type': "application/json"
		}
	}
	var guid = new Date().getTime().toString() + message.group_id
	var body = {
		"message": {
			"source_guid": guid,
			"text": toSend,
			"attachments": attachments
		}
	}
	if (message.chat_id) {
		guid = new Date().getTime().toString() + message.chat_id.toString()
		options = {
			hostname: 'api.groupme.com',
			path: `/v3/direct_messages?token=${token}`,
			method: 'POST',
			headers: {
				'Content-Type': "application/json"
			}
		}
		body = {
			"message": {
				"source_guid": guid,
				"text": toSend,
				"recipient_id": message.sender_id,
				"attachments": []
			}
		}
	}
	//Creates the request to send the request
	let req = https.request(options,  (response) => {
		console.log(`Status: ${response.statusCode}`);
		response.setEncoding('utf8');
		response.on('data', (chunk) => {
			console.log(`Body: ${chunk}`);
		})
		response.on('end', () => {
			console.log("End of conversation.");
		})
	});
	//Logs errors and sends the request
	req.on('error', (e) => {console.error(`Problem: ${e.message}`)});
	req.end(JSON.stringify(body));
}

exports.getMembers = function getMembers(message, token, callback) {
	var options = {
		hostname: 'api.groupme.com',
		path: `/v3/groups/${message.group_id}?token=${token}`,
		method: 'GET',
	}
	//Creates the request to send the request
	let req = https.request(options,  (response) => {
		console.log(`Status: ${response.statusCode}`);
		response.setEncoding('utf8');
		var chunks = ""
		response.on('data', (chunk) => {
			chunks += chunk
		})
		response.on('end', () => {
			console.log("End of conversation.");
			callback(JSON.parse(chunks))
		})
	});
	//Logs errors and sends the request
	req.on('error', (e) => {console.error(`Problem: ${e.message}`)});
	req.end();
}

