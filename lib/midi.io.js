// # midi.io.js
// a nodejs middleware used for exposing midi hardware
// via http and websockets.

var midi = require('midi'),
	fs = require('fs'),
	Devices = require(__dirname + '/../src/models/devices');

// the middlware is responsible for creating an http interface
// used for accessing midi devices, and forwarding all
// incoming midi messages over socket.io.
module.exports = function(io, path) {

	var devices = new Devices();
	path = path || '/midi/devices';

	// since socket.io namespaces cannot evaluate regexp,
	// we just create 10 separate interfaces on run. ideally,
	// this would set up an arbitrary route: /midi/devices/:id,
	// as opposed to /midi/devices/1..10.
	for (var i = 0; i < 10; i++) {
		(function(port) {
			io
				.of('/midi/devices/' + port)

				// whenever a new websocket connects,
				// we should forward all midi messages from the
				// device with the appropriate id.
				.on('connection', function(socket) {
					try {

						var input = new midi.input();
						input.openPort(port);

						input.on('message', function(delay, message) {
							socket.emit('midi', message);
						});

						socket.on('disconnect', function() {
							input.closePort(port);
						});

					} catch(e) {}
				});
		})(i);
	}

	// the middleware function is responsible
	// for serving normal http requests- used for reading
	// metadata about the midi devices.
	return function(req, res, next) {

		var matches;

		// get midi device details
		// GET /midi/devices/2
		if (matches = req.url.match(new RegExp('/midi/devices/(.+)?'))) {
			var id = matches[1],
				input;
			devices.fetch({
				success: function() {
					input = devices.get(id);
					if (input) {
						res.writeHead(200);
						res.end(JSON.stringify(input));
					} else {
						res.writeHead(404);
						res.end();
					}
				},
				error: function() {
					res.writeHead(500);
					res.end(JSON.stringify({ error: 'something went wrong' }));
				}
			});

		// get all midi devices
		// GET /midi/devices
		} else if (matches = req.url.match('/midi/devices')) {
			devices.fetch({
				success: function() {
					res.writeHead(200);
					res.end(JSON.stringify(devices));
				},
				error: function() {
					res.writeHead(500);
					res.end(JSON.stringify({ error: 'something went wrong' }));
				}
			});

		// set up static server for client lib
		} else if (req.url.match('/midi.io/midi.io.js')) {
			fs.readFile(__dirname + '/../src/client/midi.io.js', 'utf8', function(err, file) {
				if (err) {
					res.writeHead(500);
					res.end();
				} else {
					res.writeHead(200);
					res.end(file);
				}
			});
			
		} else {
			next();
		}

	};

};