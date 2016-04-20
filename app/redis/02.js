var async = require('async');
var redisClient = require('../config').redisClient;

var userList = [];
var userObj = null; 
var results = ['5715aaf5ad4451bc13931b4c','5715ce859d7b367b204e74f3', '5715cdd2f160f81120fc8e82'];
async.forEachSeries(results, function(item, done) {
    redisClient.multi([
        ['get', 'users:_id:' + item + ':username'],
        ['get', 'users:_id:' + item + ':avatar'],
        ['get', 'users:_id:' + item + ':createTime']
    ]).exec(function(err, results) {
        if (err) {
            done(err);
        }
        userObj = {};
        if (userObj.username) {
        	userObj._id = item;
	        userObj.avatar = results[1];
	        userObj.createTime = results[2];
	        userList.push(userObj);
	        userObj = null;
	        done(null);
        }
    });
}, function(err) {
	console.log('userList', userList);
});