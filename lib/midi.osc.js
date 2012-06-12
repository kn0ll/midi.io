var midi = require('midi'),
	fs = require('fs'),
	Devices = require(__dirname + '/../src/models/devices');

var devices = new Devices();

module.exports = function(io, path) {

	path = path || '/midi/devices';

	// handle websocket requests
	for (var i = 0; i < 10; i++) {

		// hack:
		// since socket.io doesn't support wildcard channel names
		// we just set up 10 ports to listen for midi
		// ideally, it would accept /midi/devices/*
		// and check if the port exists
		(function(port) {
			io
				.of('/midi/devices/' + port)
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

	// handle regular http requests
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