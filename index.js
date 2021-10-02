const instance_skel = require('../../instance_skel')
const config = require('./config');
const actions = require('./actions');
var feedback = require('./feedback');
var presets       = require('./presets');
var osc = require('osc');
var debug;
var log;
const remotePort = 57125;
const localPort = 57124;
const stateDesc = {
	paused: "Paused",
	expired: "Expired",
	running: "Running"
}

class instance extends instance_skel {
	constructor(system, id, config) {
		super(system, id, config);
		Object.assign(this, {...actions,...feedback,...presets});
		this.feedbackstate = {
			colour: 'green',
			state: 'STOPPED',
			mode: 'TIMER',
		};
		this.actions();
	}

	actions(system) {
		this.setActions(this.getActions());
	}

	config_fields() {
		return config.fields;
	}

	destroy() {
		this.debug('destroy', this.id);
		this.status(this.STATUS_UNKNOWN, "Disabled");
		this.oscListener.destroy();
	}

	init() {
		console.log('OctoCue init');
		debug = this.debug;
		log = this.log;
		this.log('debug', "OctoCue module initiated");
		this.status(this.STATE_OK);
		//console.log(this.config);
		this.initOsc();
		this.initFeedbacks();
		this.initVariables();

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

	initOsc() {

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
				this.log('info', `Listening for OctoCue OSC messages on ${localPort}`);
				this.sendOsc('/octocue/subscribe/clock',{type:'i',value: localPort});
			});

			this.oscListener.on("message",  (oscMsg, timeTag, info) => {
				console.log("An OSC message just arrived!", oscMsg);
				if (oscMsg.address == '/octocue/clock/status') {
					this.hours = oscMsg.args[0].value;
					this.minutes = oscMsg.args[1].value;
					this.seconds = oscMsg.args[2].value;
					this.colour = oscMsg.args[3].value;
				
					let h = this.formatTime(this.hours);
					let m = this.formatTime(this.minutes);
					let s = this.formatTime(this.seconds);
					let negSign = oscMsg.args[3].value ? '- ' : '';
			
					this.setVariable('time_h', this.hours);
					this.setVariable('time_m', m);
					this.setVariable('time_s', s);
					this.setVariable('time_hms', `${negSign}${h}:${m}:${s}`);
					this.setVariable('time_hm', `${negSign}${h}:${m}`);
					this.setVariable('time_ms', `${negSign}${m}:${s}`);
					this.setVariable('negSign', negSign);
					this.setVariable('state', stateDesc[oscMsg.args[5].value]);
					this.setVariable('visible', oscMsg.args[6].value);

					this.feedbackstate.colour = oscMsg.args[4].value
					this.checkFeedbacks('state_colour');
					
				}


			});
		}

	}

	formatTime(t) {
		return (t.toString()).padStart(2,'0');
	}

	initFeedbacks() {
		// feedbacks
		var feedbacks = this.getFeedbacks();

		this.setFeedbackDefinitions(feedbacks);
	}

	initVariables() {

		var variables = [
			{
				label: 'State of timer (Running, Paused, Expired)',
				name: 'state'
			},
			{
				label: 'Display time (hh:mm:ss)',
				name: 'time_hms'
			},
			{
				label: 'Display time (hh:mm)',
				name: 'time_hm'
			},
			{
				label: 'Display time (mm:ss)',
				name: 'time_ms'
			},
			{
				label: 'Negative time symbol',
				name: 'negSign'
			},
			{
				label: 'Display time (hours)',
				name: 'time_h'
			},
			{
				label: 'Display time (minutes)',
				name: 'time_m'
			},
			{
				label: 'Display time (seconds)',
				name: 'time_s'
			},
		];
		this.setVariableDefinitions(variables);
		this.setVariable("state", "Paused")
		this.setVariable('time_hms', '00:00:00');
		this.setVariable('time_hm', '00:00');
		this.setVariable('time_ms', '00:00');
		this.setVariable('negSign', ' ');
		this.setVariable('time_h', '00');
		this.setVariable('time_m', '00');
		this.setVariable('time_s', '00');

		
	}

	updateTime() {
		var info = this.feedbackstate.time.split(':');

		this.setVariable('time', this.feedbackstate.time);
		this.setVariable('time_hm', info[0] + ':' + info[1]);

		this.setVariable('time_h', info[0]);
		this.setVariable('time_m', info[1]);
		this.setVariable('time_s', info[2]);
	}
}


exports = module.exports = instance