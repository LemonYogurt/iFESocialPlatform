var redisClient = require('../config').redisClient;
var async = require('async');
/*
redisClient.scard('stars:userid:123', function (err, result) {
	console.log(result);
});
*/

async.series({
	zadd1: function (done) {
		redisClient.zadd('test:12345', Date.now(), 'liu', function (err, result) {
			if (err) {
				done(err);
			}
			console.log(result);
			done(null, result);
		});
	},
	zadd2: function (done) {
		redisClient.zadd('test:12345', Date.now(), 'chao', function (err, result) {
			if (err) {
				done(err);
			}
			console.log(result);
			done(null, result);
		});
	},
	// 数组
	zrangebyscore: function (done) {
		redisClient.zrangebyscore('test2:12345', 0, Date.now(), function (err, result) {
			if (err) {
				done(err);
			}
			
			console.log(result);
			done(null, result);
		});
	}
}, function (err, results) {
	if (err) {
		console.log(err);
	}
	console.log(results);
});
