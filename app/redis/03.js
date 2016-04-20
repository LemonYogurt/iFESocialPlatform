var redisClient = require('../config').redisClient;

redisClient.scard('stars:userid:123', function (err, result) {
	console.log(result);
});