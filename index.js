const Discord = require('discord.js')
const auth = require('./auth.json')
const dice = require('./dice.js')
const bs = require('./bullshit.js')

const fs = require('fs')


const bot = new Discord.Client()

// Removes the !whatever from the front
// For example, if I call scanCommand(!def reece 'this macro')
// it should return ["reece","this macro"]
function scanCommand(cmd) {
	const args = cmd.split(' ').slice(1).join(' ')
	return args.match(/(?:[^\s"]+|"[^"]*")+/g)
}


let macros = {}
function readMacros() {
	macros = require('./macros.json')
	console.log('Loaded macros: ' + JSON.stringify(macros))
}

function saveMacros() {
	const macrodata = JSON.stringify(macros)
	fs.writeFile('macros.json', macrodata, (err) => {
		if (err) console.log('Macro not added: ' + err)
		else console.log('Macros saved!')
	})
}

function addMacro(m, r) {
	function trim(s) {
		if(s[0] == '"' && s[s.length - 1] == '"') {
			return s.slice(1, -1)
		}
		else {
			return s
		}
	}
	console.log('Adding macro: ' + m + ' => ' + r)
	macros[m] = r
	saveMacros()
}

function undef(m) {
	delete macros[m]
	saveMacros()
}

function macroSub(text) {
	for (const k in macros) {
		console.log('Key: ' + k)
		console.log('Value: ' + macros[k])
		text = text.replace(k, macros[k])
	}
	return text
}

bot.on('message', msg => {
	if(msg.author.id == bot.user.id) {
		return
	}
	const text = msg.content

	if(text[0] == '!') {
		if(text.startsWith('def', 1)) {
			const args = scanCommand(text)
			if(args.length != 2) {
				msg.channel.send('Macro definition requires exactly 2 arguments, found ' + args.length + '!')
			}
			else {
				addMacro(args[0], args[1])
			}
		}
		else if(text.startsWith('macros', 1)) {
			const macrolist = JSON.stringify(macros)
			msg.channel.send(macrolist)
		}
		else if(text.startsWith('undef', 1)) {
			const args = scanCommand(text)
			if(args.length != 1) {
				msg.channel.send('Undef requires exactly 1 argument, found ' + args.length + '!')
			}
			else {
				undef(args[0])
			}
		}
		else if(text.startsWith('roll', 1)) {
			const args = scanCommand(text)
			const dstring = args.join(' ')
			try {
				const result = dice(dstring)
				const out = result.sum + result.rolls.reduce((a, n) => a + n, 0)
				msg.channel.send(JSON.stringify(result))
				msg.channel.send('You rolled ' + out)
			}
			catch(err) {
				msg.channel.send('Error: ' + err)
			}
		}
		else if(text.startsWith('bullshit', 1)) {
			const args = scanCommand(text)
			const effect = bs()
			if(args != null && args.length > 0) {
				if(args[0] == 'secret') {
msg.author.createDM().then((dm) => {
					dm.send('Effect: ' + effect)
				})
				}
			}
			else {
				msg.channel.send('Effect: ' + effect)
			}
		}
	}
	console.log(msg.channel.name)
	console.log(msg.content)
	msg.channel.send(macroSub(msg.content))
})

bot.on('ready', () => {
	console.log('Connected')
	readMacros()
})

bot.login(auth.token)
