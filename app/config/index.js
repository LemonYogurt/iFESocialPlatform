var mongoose = require('mongoose');
var redis = require('redis');

// mongodb
var mongoConfig = {
	host: '127.0.0.1',
	port: 27017,
	db: 'ife'
};
var mongodbURI = 'mongodb://' + mongoConfig.host + ':' + mongoConfig.port + '/' + mongoConfig.db;
var mongodbClient = mongoose.connect(mongodbURI);

mongodbClient.connection.on('error', function (err) {
	console.log(err);
});

// redis

var redisConfig = {
	host: '127.0.0.1',
	port: 6379
}
var redisClient = redis.createClient(redisConfig.port, redisConfig.host);

redisClient;

exports.redisClient = redisClient;
exports.mongodbClient = mongodbClient;