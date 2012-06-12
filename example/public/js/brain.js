var devices = new MidiDevices();

devices.fetch({

	success: function() {

		console.log('found midi devices:', devices.map(function(device) {
			return device.get('name');
		}));

		console.log('waiting for midi learn');

		devices.learn(function(msg) {
			console.log('hello world!', msg);
		});

	}

});