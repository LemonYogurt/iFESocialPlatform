var async = require('async');
var redisClient = require('../config').redisClient;
var User = require('../models/user');

function getUserInfoInRedis(userid, cb) {
	// createTime, stars, fans, articles, username, avatar
	async.series({
		stars: function(done) {
            redisClient.scard('stars:userid:' + userid, function(err, count) {
                if (err) {
                    done({msg: '查询关注人数错误'});
                } else {
                    if (!count) {
                        count = 0;
                    }
                    done(null, count);
                }
            });
        },
        fans: function(done) {
            redisClient.scard('fans:userid:' + userid, function(err, count) {
                if (err) {
                    done({msg: '查询粉丝人数错误'});
                } else {
                    if (!count) {
                        count = 0;
                    }
                    done(null, count);
                }
            });
        },
        articles: function (done) {
            redisClient.get('currentpostnum:userid:' + userid, function (err, result) {
                if (err) {
                    done({msg: '得到当前用户发布文章数量失败'});
                } else {
                    if (!result) {
                        result = 0;
                    }
                    done(null, result);
                }
            });
        },
        username: function (done) {
        	redisClient.get('users:userid:' + userid + ':username', function (err, result) {
                if (err) {
                    done({msg: '得到当前用户的用户名错误'});
                } else {
                    done(null, result);
                }
            });
        },
        avatar: function (done) {
        	redisClient.get('users:userid:' + userid + ':avatar', function (err, result) {
                if (err) {
                    done({msg: '得到当前用户的头像错误'});
                } else {
                    if (result == '/images/defaultAvatar.png') {
                        result = '/images/ife_userDefaultAvatar_little.gif';
                    }
                    done(null, result);
                }
            });
        },
        createTime: function (done) {
            redisClient.get('users:userid:' + userid + ':createTime', function (err, result) {
                if (err) {
                    done({msg: '得到当前用户的注册时间错误'});
                } else {
                    done(null, result);
                }
            });
        }
	}, function (err, results) {
        cb(err, results);
	});
}

function getUserInfoInMongo(userid, cb) {
    User.findOne({_id: userid}, function(err, doc) {
        if (err) {
            console.log('getUserInfoInMongo----', err);
        } else {
            if (doc.avatar == '/images/defaultAvatar.png') {
                doc.avatar = '/images/ife_userDefaultAvatar_little.gif';
            }
            cb(err, doc);
        }
    });
}

function getUserCompleteInfo(userid, cb) {
    var user = {};
    async.series({
        getUserInfoInRedis: function (done) {
            getUserInfoInRedis(userid, function (err, results) {
                if (err) {
                    done(err);
                } else {
                    user = results;
                    done(null, results);
                }
            });
        },
        getUserInfoInMongo: function (done) {
            if (!user.username) {
                getUserInfoInMongo(userid, function (err, doc) {
                    if (err) {
                        done(err);
                    } else {
                        user.username= doc.username;
                        user.avatar = doc.avatar;
                        user.createTime = doc.createTime;
                        done(null, doc);
                    }
                });
            } else {
                done(null);
            }
        }
    }, function (err, results) {
        user.userid = userid;
        cb(err, user);
    });
}

/*
key: stars value: 6                                                     
key: fans value: 0                                                      
key: articles value: 0                                                  
key: username value: a                                                  
key: avatar value: /images/ife_userDefaultAvatar_little.gif            
key: createTime value: Mon Apr 25 2016 11:09:05 GMT+0800 (CST)
*/
/*
getUserCompleteInfo('571d8a511a9f35656b9e630a', function (err, user) {
    for (var key in user) {
        console.log('key: ' + key + ' value: ' + user[key]);
    }
});
*/
module.exports = getUserCompleteInfo;