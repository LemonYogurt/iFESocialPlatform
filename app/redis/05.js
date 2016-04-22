var redisClient = require('../config').redisClient;
var async = require('async');
/*
redisClient.scard('stars:userid:123', function (err, result) {
	console.log(result);
});
*/

async.series({
	hgetall: function (done) {
		redisClient.hgetall('comment:commentid:5718b4cb42e2c86c4c57d21a', function (err, result) {
			console.log(result);
			done(result);
		});
	}
}, function (err, results) {
	if (err) {
		console.log(err);
	}
	console.log(results);
});


