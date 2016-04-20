var redisClient = require('../config').redisClient;
var doc = {
	_id: '5715aaf5ad4451bc13931b4c'
}
redisClient.multi([
	['get', 'users:_id:' + doc._id + ':username'],
	['get', 'users:_id:' + doc._id + ':password'],
	['get', 'users:_id:' + doc._id + ':avatar'],
	['get', 'users:_id:' + doc._id + ':createTime'],
	['get', 'users:_id:' + doc._id + ':avatarFlag']
]).exec(function(err, result) {
    if (err) {
    	console.log(err);
    }
    /*
    	[ '韩非',
		  '123456',
		  '/images/defaultAvatar.png',
		  'Tue Apr 19 2016 11:50:13 GMT+0800 (CST)',
		  'false' ]

    */
    console.log(result);
});

redisClient.lpush('latestreguserlink', doc._id, function (err, count) {
	if (err) {
		console.log('添加最新注册用户失败');
	}
	redisClient.ltrim('latestreguserlink', 0, 49, function (err, result) {
		console.log(result);
		redisClient.lrange('latestreguserlink', 0, -1, function (err, result) {
			console.log(result);
		});
	});
});
