var mongoose = require('mongoose');
var mongoConfig = {
	host: '127.0.0.1',
	port: 27017,
	db: 'ife'
};

var mongodbURI = 'mongodb://' + mongoConfig.host + ':' + mongoConfig.port + '/' + mongoConfig.db;
var mongodb = mongoose.connect(mongodbURI);

mongodb.connection.on('error', function (err) {
	console.log(err);
});

exports.mongodb = mongodb;