const instance_skel = require('../../instance_skel')
const cfg = require('./config');
const actions = require('./actions');
var osc = require('osc');
var debug;
var log;
const remotePort = 57125;
const localPort = 57124;

class instance extends instance_skel {
	constructor(system, id, config) {
		super(system, id, config)
		//console.log(config);

		// Object.assign(this, {
		// 	...actions,
		// })

		//return this
	}

	config_fields() {
		return cfg.fields;
	}

	destroy() {
		this.debug('destroy', this.id);
		this.status(this.STATUS_UNKNOWN, "Disabled")
	}

	init() {
		console.log('OctoCue init');
		this.setActions(actions.config);
		debug = this.debug;
		log = this.log;
		this.log('debug', "OctoCue Init");
		this.status(this.STATE_OK);
		//console.log(this.config);
		this.init_osc();

	}

	updateConfig(config) {
		console.log(config);
		this.config = config;
	}

	action(action) {
		console.log(action);
		let message = actions.doAction(action);
		if (message.type == 'osc') {
			this.sendOsc(message.address, message.args);
		}
		//console.log(message);
	}

	sendOsc(address, args) {
		//console.log('Config:');
		//console.log(this.config);
		var host = "127.0.0.1";
		if (this.config.host !== undefined && this.config.host !== "") {
			host = this.config.host;
		}
		//console.log(`Host: ${host}, address: ${address} port: ${port} args:${args}`)
		this.system.emit('osc_send', host, remotePort, address, args);
	}

	init_osc() {

		if (this.connecting) {
			return;
		}

		if (this.oscListener) {
			this.oscListener.close();
		}

		if (this.config.host) {
			this.oscListener = new osc.UDPPort({
				localAddress: "0.0.0.0",
				localPort: localPort,
				address: "127.0.0.1",
				port: remotePort,
				metadata: true
			});
			this.connecting = true;

			this.oscListener.open();

			this.oscListener.on("error", (err) => {
				debug("Error", err);
				this.log('error', "Error: " + err.message);
				this.connecting = false;
				this.status(this.STATUS_ERROR, "Can't connect to DiGiCo");
				if (err.code == "ECONNREFUSED") {
					this.oscListener.removeAllListeners();
				}
			});

			this.oscListener.on("close", () => {
				this.log('error', "Connection to DiGiCo Closed");
				this.connecting = false;
				this.status(this.STATUS_WARNING, "CLOSED");
			});

			this.oscListener.on("ready", () => {
				this.connecting = false;
				this.log('info', "Connected to DiGiCo:" + this.config.host);
			});

			this.oscListener.on("message", function (oscMsg, timeTag, info) {
				//console.log("An OSC message just arrived!", oscMsg);
				if (oscMsg.address == '/octocue/clock/status') {
					this.hours = oscMsg.args[0].value;
					this.minutes = oscMsg.args[1].value;
					this.seconds = oscMsg.args[2].value;
					this.colour = oscMsg.args[3].value;
					console.log(`Clock: ${this.hours}:${this.minutes}:${this.seconds} ${this.colour}`);
				}


			});
		}

	}
}


exports = module.exports = instance