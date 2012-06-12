/*

single midi device
var device = new MidiDevice({ id: 0 });
device.on('midi', function(msg) { console.log(msg); });

*/

var MidiDevice = Backbone.Model.extend({

	urlRoot: '/midi/devices',

	defaults: {
		id: 0
	},

	// when the model is created, we start
	// listening for and broacasting midi events
	initialize: function() {
		var socket = io.connect(this.url());
		socket.on('midi', _.bind(this.sendMidi, this));
	},

	sendMidi: function(msg) {
		this.trigger('midi', msg)
	}

}, Backbone.Events);

/*

manager for multiple devices

var midi = new MidiDevices();

midi.fetch({
	success: function() {
		console.log(midi.models)
	}
});

midi.learn(function() {
	alert('hello world');
});

*/

var MidiDevices = Backbone.Collection.extend({

	url: '/midi/devices',
	model: MidiDevice,

	events: {},

	initialize: function() {

		var self = this;

		self.events = {};

		// whenever a midi note from any device is received
		// check if it has a learned function and call it
		self.on('midi', function(msg) {
			if (this.events[msg[0]]) {
				if (this.events[msg[0]][msg[1]]) {
					this.events[msg[0]][msg[1]](msg);
				}
			}
		});

	},

	// `learn` takes a function reference and ties it's execution
	// to the midi event triggered following the call to learn
	learn: function(cb) {

		var self = this;

		// on the first midi event, unbind the learn
		// and add the callback to the events hash
		function learn(msg) {
			self.events[msg[0]] = self.events[msg[0]] || {};
			self.events[msg[0]][msg[1]] = cb;
			self.off('midi', learn);
		}

		// listen for the next midi event on all devices
		self.on('midi', learn);

	}

}, Backbone.Events);