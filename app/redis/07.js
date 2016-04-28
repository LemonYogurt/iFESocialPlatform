var redisClient = require('../config').redisClient;
var async = require('async');
var users = [];

for (var i = 0; i < 10; i++) {
	users.push({username: 'user' + i, password: '123abc' + i, avatar: '/images/sadfadf.gif', _id: '123428hyohdsf23'});
}


async.series({
	selectDB: function (done) {
		redisClient.select(2, function (err, result) {
			done(err, result);
		});
	},
	setData: function (done) {
		redisClient.set('socket', JSON.stringify(users), function (err, result) {
			done(err, result);
		});
	},
	getData: function (done) {
		redisClient.get('socket', function (err, result) {
			done(err, result);
		});
	}
}, function (err, results) {
	console.log(Object.prototype.toString.call(JSON.parse(results.getData)));
	console.log(JSON.parse(results.getData));
});
// function indexOf(arr, obj, attr) {
// 	for (var i = 0; i < arr.length; i++) {
// 		if (obj[attr] == arr[i][attr]) {
// 			return i;
// 		}
// 	}

// 	return -1;
// }
// var users = [];

// for (var i = 0; i < 10; i++) {
// 	users.push({username: 'user' + i, password: '123abc' + i, avatar: '/images/sadfadf.gif', _id: '123428hyohdsf23'});
// }

// console.log(indexOf(users, {username: 'user4'}, 'username'));