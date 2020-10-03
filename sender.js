const https = require('https')
const fs = require('fs')
const mime = require('mime')

module.exports = class Sender {
	constructor(token) {
		this.token = token
	}

	async send(toSend, message) {
		//console.log(toSend)
		return new Promise(async (resolve, reject) => {
			if (toSend.length > 1000) {
				for (var i = 0; i < toSend.length / 1000; i++) {
					await this.send(toSend.substring(1000 * i, 1000*(i+1)), message)
				}
				return;
			}
			//Creates some options to let the message be sent with the GroupMe API
			var options = {
				hostname: 'api.groupme.com',
				path: `/v3/groups/${message.group_id}/messages?token=${this.token}`,
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
					path: `/v3/direct_messages?token=${this.token}`,
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
					//console.log(`Body: ${chunk}`);
				})
				response.on('end', () => {
					resolve()
				})
			});
			//Logs errors and sends the request
			req.on('error', (e) => {console.error(`Problem: ${e.message}`)});
			req.end(JSON.stringify(body));
		})
	}

	async sendImage(toSend, image, message) {
		return new Promise((resolve, reject) => {
		//Creates some options to let the message be sent with the GroupMe API
			var options = {
				hostname: 'api.groupme.com',
				path: `/v3/groups/${message.group_id}/messages?token=${this.token}`,
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
					path: `/v3/direct_messages?token=${this.token}`,
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
			let req = https.request(options, (response) => {
				//console.log(`Status: ${response.statusCode}`);
				response.setEncoding('utf8');
				response.on('data', (chunk) => {
					//console.log(`Req Body: ${chunk}`)
				})
				response.on('end', () => {
					console.log("Resolving")
					resolve()
				})
			});
			//Logs errors and sends the request
			req.on('error', (e) => {console.error(`Problem: ${e.message}`)});
			req.end(JSON.stringify(body));
		})
	}

	async like(message) {
		return new Promise((resolve, reject) => {
			var options = {
				hostname: 'api.groupme.com',
				path: `/v3/messages/${message.chat_id ? message.chat_id : message.group_id}/${message.id}/like?token=${this.token}`,
				method: 'POST',
				headers: {
					'Content-Type': "application/json"
				}
			}
			//Creates the request to send the request
			let req = https.request(options,  (response) => {
				//console.log(`Status: ${response.statusCode}`);
				response.setEncoding('utf8');
				response.on('data', (chunk) => {
					//console.log(`Body: ${chunk}`);
				})
				response.on('end', () => {
					resolve()
				})
			});
			//Logs errors and sends the request
			req.on('error', (e) => {console.error(`Problem: ${e.message}`)});
			req.end();
		})
	}

	async nickname(name, message) {
		return new Promise((resolve, reject) => {
			var body = {
				"membership": {
					"nickname": `${name}`
				}
			}
			var options = {
				hostname: 'api.groupme.com',
				path: `/v3/groups/${message.group_id}/memberships/update?token=${this.token}`,
				method: 'POST',
				headers: {
					'Content-Type': "application/json"
				}
			}
			//console.log(body)
			//console.log(options)
			//Creates the request to send the request
			let req = https.request(options,  (response) => {
				//console.log(`Status: ${response.statusCode}`);
				response.setEncoding('utf8');
				response.on('data', (chunk) => {
					//console.log(`Body: ${chunk}`);
				})
				response.on('end', () => {
					resolve()
				})
			});
			//Logs errors and sends the request
			req.on('error', (e) => {console.error(`Problem: ${e.message}`)});
			req.end(JSON.stringify(body));
		})
	}

	async sendWithAtts(toSend, message, attachments) {
		return new Promise((resolve, reject) => {
			//Creates some options to let the message be sent with the GroupMe API
			var options = {
				hostname: 'api.groupme.com',
				path: `/v3/groups/${message.group_id}/messages?token=${this.token}`,
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
					path: `/v3/direct_messages?token=${this.token}`,
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
				//console.log(`Status: ${response.statusCode}`);
				response.setEncoding('utf8');
				response.on('data', (chunk) => {
					//console.log(`Body: ${chunk}`);
				})
				response.on('end', () => {
					resolve()
				})
			});
			//Logs errors and sends the request
			req.on('error', (e) => {console.error(`Problem: ${e.message}`)});
			req.end(JSON.stringify(body));
		})
	}

	getMembers(message, callback) {
		var options = {
			hostname: 'api.groupme.com',
			path: `/v3/groups/${message.group_id}?token=${this.token}`,
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

	async uploadImage(file) {
		return new Promise((resolve, reject) => {
			console.log(file)
			const stat = fs.statSync(file)
			console.log(stat)
			//Creates some options to let the message be sent with the GroupMe API
			var options = {
				host: "image.groupme.com",
				path: "/pictures",
				method: "POST",
				headers: {
					'Content-Type': mime.getType(file),
					'Content-Length': stat.size
				}
			}
			console.log(options)
			var req = https.request(options,  (response) => {
				console.log(`Status: ${response.statusCode}`);
				response.setEncoding('utf8');
				//Reads data
				var toReturn = "";
				response.on('data', (chunk) => {
					toReturn += chunk;
				})
				//Returns data
				response.on('end', () => {
					//fs.unlinkSync(file)
					try {
						resolve(JSON.parse(toReturn).payload.url);
					} catch(err) {
						console.error(toReturn)
						console.error(err)
						reject(err)
					}
				})
			});
			req.setHeader("Content-Type", "image/jpeg")
			req.setHeader("X-Access-Token", this.token)
			//Logs errors and sends the request
			req.on('error', (e) => {console.error(`Problem: ${e.message}`)});
			var fileData = fs.createReadStream(file)
			fileData.on('open', () => {
				console.log('Piping')
				fileData.pipe(req)
			})
			fileData.on('data', (chunk) => {
				console.log(`Received ${chunk.length} datas`)
			})
			fileData.on('error', () => {
				console.error('Problem!')
				req.end()
			})
		})
	}
}
