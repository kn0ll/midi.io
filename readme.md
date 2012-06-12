midi.io
===
a midi library for the web browser built on nodejs.

installation
---

    $ npm install midi.io

[example app](https://github.com/catshirt/midi.io/tree/master/example) contained for reference.

use
---
midi.io is a connect middleware. it requires a socket.io instance as it's first argument.

	var connect = require('connect'),
		socketio = require('socket.io'),
		midi = require('midi.io');

	var server = connect.createServer(),
		io = socketio.listen(server);

	server.use(midi(io));
	server.listen(9000);

the server above will create the following resources:

`GET /midi/devices` - show all midi devices  
`GET /midi/devices/:id` - get a specific midi device by port number  
`WS /midi/devices/:id` - creates a websocket subscription to midi events from a specific device

client library
---
a backbone client library is also provided. it creates two classes:

`MidiDevice` - this is a backbone model which emits midi events  
`MidiDevices` - this is a collection to manage multiple devices

	<script src="/midi.io/midi.io.js"></script>
	<script>

		var devices = new MidiDevices();

		// show all midi devices
		devices.fetch({
			success: function() {
				console.log('found devices', devices.models);
			}
		});

		// tie a midi event to a specific function
		devices.learn(function() {
			console.log('the next midi button pressed will always log me!');
		});

		// log all midi events for all devices
		devices.on('midi', function(msg) {
			console.log('got midi', msg);
		});

	</script>