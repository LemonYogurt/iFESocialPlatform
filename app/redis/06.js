var redisClient = require('../config').redisClient;
var async = require('async');

async.series({
	selectDB: function (done) {
		redisClient.select(2, function (err, result) {
			done(err, result);
		});
	},
	// 得到的是数组
	getInterResults: function (done) {
		redisClient.sinter('test1', 'test2', function (err, result) {
			if (result) {
				console.log(Object.prototype.toString.call(result));				
			}
			done(err, result);
		});
	},
	// 如果不存在的话，得到的是一个空数组
	testInterResults: function (done) {
		redisClient.sinter('test3', 'test4', function (err, result) {
			if (result) {
				console.log(Object.prototype.toString.call(result));				
			}
			done(err, result);
		});
	}
}, function (err, results) {
	console.log(results.getInterResults);
	console.log(results.testInterResults);
});