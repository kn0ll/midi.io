# midi.io

a library for capturing midi hardware input in the browser. it is a nodejs middleware which listens for midi input on and forwards the midi message to the client via socket.io. [formatted documentation](http://catshirt.github.com/midi.io) is available.

## installation

    $ npm install midi.io  

## use

midi.io's primary functionality is on the server. it is responsible for creatting http and websocket routes your client can use to learn about midi devices. additionally, midi.io serves a backbone client library to use for accessing these resources. the server and client components can be used together or independently. a full [client and server example](https://github.com/catshirt/midi.io/tree/master/example) is contained in the repository for reference.

a basic midi.io server creates the following resources:

- `GET /midi/devices` - show all active midi devices  
- `GET /midi/devices/:id` - show details for a specific midi device
- `WS /midi/devices/:id` - a socket.io namespace for receiving midi messages from a specific device

## getting started (server)

to enable midi.io, simply pass it into your http server as a middleware, with your socket.io instance as it's first argument. the following example is the complete code for a simple midi.io server:

    var connect = require('connect'),
      socketio = require('socket.io'),
      midi = require('midi.io');

    var server = connect.createServer(),
      io = socketio.listen(server);

    server.use(midi(io));
    server.listen(9000);

## getting started (client)

the midi.io client library is served via `/midi.io/midi.io.js` and requires backbone. it creates a single model and a single collection used to manage your midi devices:

- `MidiDevice` - a backbone model which emits midi events
- `MidiDevices` - a backbone collection used to browse and select midi devices  

the following code shows the client library in action:

    var devices = new MidiDevices(),
      midi_device = new MidiDevice({ id: 1 });

    // get all active midi devices
    devices.fetch({
      success: function() {
        console.log('found devices', devices.models);
      }
    });

    // tie the next inbound midi message to a specific function
    devices.learn(function() {
      console.log('the next midi button pressed will always log me!');
    });

    // log all midi events for all devices
    devices.on('midi', function(msg) {
      console.log('got midi', msg);
    });

    // only log midi events from device 1
    midi_device.on('midi', function(msg) {
      console.log('got midi from device 1', msg);
    });