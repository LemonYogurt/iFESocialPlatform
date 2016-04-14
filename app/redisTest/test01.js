var redisClient = require('../config').redisClient;
var async = require('async');
var ObjectId = require('bson').ObjectId;
var username = 'username';
var password = 'hash';
var _id = new ObjectId().toString();
var avatar = '/images/defaultAvatar.png';
var avatarFlag = false;
var createTime = new Date();

async.series({
	get: function (done) {
		redisClient.multi([
			['set', 'users:_id:' + _id + ':username', username],
			['set', 'users:_id:' + _id + ':password', password],
			['set', 'users:_id:' + _id + ':avatar', avatar],
			['set', 'users:_id:' + _id + ':createTime', createTime],
			['set', 'users:_id:' + _id + ':avatarFlag', avatarFlag],
			['set', 'users:username:' + username + ':_id', _id]
		]).exec(function (err, result) {
			done(err, result);
		});
	}
}, function (err, results) {
	console.log(results);
});