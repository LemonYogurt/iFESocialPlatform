var mongoose = require('mongoose');
var ArticleSchema = new mongoose.Schema({
	_id: {
		unique: true,
		type: String
	},
	content: String,
	picURL: [
		{type: String}
	],
	createAt: {
		type: Date,
		default: Date.now()
	},
	userId: {
		type: String,
		ref: 'User'
	},
	praise: [
		{type: String, ref: 'User'}
	]
});

module.exports = ArticleSchema;