// # devices.js
// provides a simple Backbone interface for accessing
// midi input in node.js.

var Backbone = require('backbone'),
	midi = require('midi');

module.exports = Backbone.Collection.extend({

	// whenever a new collection is created,
	// we create a new instance of the midi accessor.
	initialize: function() {
		Backbone.Collection.prototype.initialize.apply(this, arguments);
		this.input = new midi.input();
	},

	// the `sync` method is responsible for finding all
	// available midi devices and adding them to the collection.
	// at this moment, this assumes `sync` is only ever called
	// in a `read` capacity.
	sync: function(method, model, options) {

		var input = this.input,
			inputs = [];

		for (var i = 0; i < input.getPortCount(); i++) {
			inputs.push({
				id: i,
				name: input.getPortName(i)
			});
		}

		this.reset(inputs);
		options.success(inputs);

	}

});