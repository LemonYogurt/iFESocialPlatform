var mongoose = require('mongoose');

var CommentSchema = new mongoose.Schema({
	_id: {
		type: String,
		unique: true
	},
	from: {
		type: String,
		ref: 'User'
	},
	to: {
		type: String,
		ref: 'User'
	},
	content: String,
	reply: [{
		from: {type: String, ref: 'User'},
		to: {type: String, ref: 'User'},
		content: String,
		createAt: {
			type: Date,
			default: Date.now()
		},
		praise: [
			{type: String, ref: 'User'}
		]
	}],
	createAt: {
		type: Date,
		default: Date.now()
	},
	articleId: {
		type: String,
		ref: 'Article'
	},
	praise: [
		{type: String, ref: 'User'}
	]
});