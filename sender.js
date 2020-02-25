const https = require('https')

exports.send = function sendMessage(toSend, token, message) {
	if (toSend.length > 1000) {
		for (var i = 0; i < toSend.length / 1000; i++) {
			setTimeout(function(i, token, message) {
				sendMessage(toSend.substring(1000 * i, 1000*(i+1)), token, message)
			}.bind(null, i, token, message), i * 250)
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
				"attachments": [
                                	{
                                        	"type": "image",
	                                        "url": image
        	                        }
                	        ]
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
