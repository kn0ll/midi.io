var Backbone = require('backbone'),
	midi = require('midi');

module.exports = Backbone.Collection.extend({

	initialize: function() {
		Backbone.Collection.prototype.initialize.apply(this, arguments);
		this.input = new midi.input();
	},

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