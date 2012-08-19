// # midi.io.js
// a client library used for accessing midi.io apis.

// `MidiDevice` is a backbone model responsible
// for listening for midi messages from a specific device.
var MidiDevice = Backbone.Model.extend({

	// the url here is used by `initialize`
	// to determine the proper socket.io namespace to connect to.
	urlRoot: '/midi/devices',

	defaults: {
		id: 0
	},

	// when the model is created, we immediately connect to socket.io
	// and begin rebroadcasting all incoming midi events.
	initialize: function() {
		var socket = io.connect(this.url());
		socket.on('midi', _.bind(this._sendMidi, this));
	},

	// _sendMidi is used for proxying socket.io messages
	// and rebroadcasting them on the model's event emitter.
	_sendMidi: function(msg) {
		this.trigger('midi', msg)
	}

}, Backbone.Events);

// `MidiDevices` is a backbone collection responsible
// for reading meta information about midi devices.
var MidiDevices = Backbone.Collection.extend({

	url: '/midi/devices',
	model: MidiDevice,

	// the `events` hash is used for mapping
	// midi messages to functions. whenever a midi event
	// is triggered on any model, it will check
	// if that event has an associated function in `events`
	// and trigger it. `events` is a 3 dimensional hash,
	// where the first and second keys map to the first
	// and second parts of the midi message, respectively.
	events: {},

	initialize: function() {

		var self = this;

		// whenever a midi note from any device is received,
		// check if it has a mapped function in `events`,
		// and call it if applicable.
		self.on('midi', function(msg) {
			if (this.events[msg[0]]) {
				if (this.events[msg[0]][msg[1]]) {
					this.events[msg[0]][msg[1]](msg);
				}
			}
		});

	},

	// `learn` takes a function reference and ties it's execution
	// to the midi event triggered following the call to learn,
	// by saving the function in the `events` hash using the midi
	// message to build the key.
	learn: function(cb) {

		var self = this;

		// on the first midi event, unbind the `learn` listener
		// and add the callback to the `events` hash.
		self.on('midi', function learn(msg) {
			self.events[msg[0]] = self.events[msg[0]] || {};
			self.events[msg[0]][msg[1]] = cb;
			self.off('midi', learn);
		});

	}

}, Backbone.Events);