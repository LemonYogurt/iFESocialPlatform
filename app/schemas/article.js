var mongoose = require('mongoose');
// 这里createAt之所以存成String类型，是因为从redis中获取到的就是String类型
// 并且渲染到前端的时候，前端已经使用了new Date进行转换了，所以这里直接就存成String类型即可
var ArticleSchema = new mongoose.Schema({
	_id: {
		unique: true,
		type: String
	},
	content: String,
	picURL: String,
	createAt: Date,
	userid: {
		type: String,
		ref: 'User'
	},
	username: {
		type: String,
		ref: 'User'
	},
	avatar: {
		type: String,
		ref: 'User'
	},
	praise: [
		{type: String, ref: 'User'}
	],
	comments: [
		{
			_id: String,
			to: {
				type: String,
				ref: 'User'
			},
			from: {
				type: String,
				ref: 'User'
			},
			content: String,
			praise: [
				{type: String, ref: 'User'}
			],
			fromUsername: {
				type: String,
				ref: 'User'
			},
			toUsername: {
				type: String,
				ref: 'User'
			},
			fromAvatar: {
				type: String,
				ref: 'User'
			},
			createAt: Date,
			scomments: [
				{
					_id: String,
					to: {
						type: String,
						ref: 'User'
					},
					from: {
						type: String,
						ref: 'User'
					},
					content: String,
					praise: [
						{type: String, ref: 'User'}
					],
					createAt: Date,
					fromUsername: {
						type: String,
						ref: 'User'
					},
					toUsername: {
						type: String,
						ref: 'User'
					},
					fromAvatar: {
						type: String,
						ref: 'User'
					}
				}
			]
		}
	]
});

module.exports = ArticleSchema;