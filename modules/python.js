const fs = require('fs');
const https = require('https')

const regex = /^\/compile\s?python\s*\n*/i;
const stopRegex = /^\/stop/i;

exports.mod = class python {
	constructor(sender) {
		this.name = "Python"
		this.helpString = "/compile Python [code] will compile and run some Python code!"
		this.processes = []
		this.sender = sender
	}

	checkMessage(message) {
		if (stopRegex.test(message.text)) {
			for (var i in this.processes) {
				try {
					this.processes[i].kill()
				} catch (error) {
					console.log(error)
				}
			}
			this.sender.send("All scripts have been stopped!", message)
			this.processes = []
			return true
		}
		if (regex.test(message.text)) {
			this.sender.like(message)
			var that = this
			var code = message.text
			var string = message.text.match(regex)[0]
			code = code.substring(string.length, code.length)
			var name = "./python/"
			let dateName = new Date()
			name += dateName.getTime().toString()
			name += ".py"
			if (!fs.existsSync("./python")){
				fs.mkdirSync("./python");
			}
			fs.writeFileSync(name, code, 'utf-8')
			var spawn = require("child_process").spawn;
			var subProcess = spawn('python3.7', [name])
			subProcess.stderr.on('data', (err) => {
				this.sender.send(err.toString(), message)
			});
			subProcess.stdout.on('data', function(data) {
				console.log('Pausing to reduce spam')
				subProcess.kill('SIGSTOP')
				setTimeout( () => {
					subProcess.kill('SIGCONT')
					console.log('Resuming process!');
				} , 2000)
				let toSend = data.toString()
				if (toSend.length > 500) {
					subProcess.kill()
				}
				let array = toSend.split('\n')
				if (array.length > 10) {
					toSend = array[0] + '\n' + array[1] + '\n' + array[2] + '\n(Rest of message truncated to reduce spam)'
				}
				if (toSend.length > 500) {
					toSend = toSend.substring(0, 100) + '\n(Rest of message truncated to reduce spam)'
				}
				this.sender.send(toSend, message)
			});
			subProcess.on('exit', function(code) {
				let index = that.processes.indexOf(subProcess)
				if (index > -1) { that.processes.splice(index,1) }
			})
			this.processes.push(subProcess)
			return true
		} else return false
	}
}
