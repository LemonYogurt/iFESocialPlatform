var express = require('express');
var async = require('async');
var redisClient = require('../config').redisClient;
var router = express.Router();

router.get('/', function(req, res, next) {
    var session = req.session;
    var user = session.user;
    if (user.avatar == '/images/defaultAvatar.png') {
        user.avatar = '/images/ife_userDefaultAvatar_little.gif';
    }
    var starsArr = [];
    if (!session.user) {
        res.render('pages/ife_valitor');
    } else {
        async.series({
            /*
             * 得到侧边栏的数据
             */
            stars: function(done) {
                redisClient.scard('stars:userid:' + user._id, function(err, count) {
                    if (err) {
                        done('查询关注人数错误');
                    } else {
                        done(null, count);
                    }
                });
            },
            fans: function(done) {
                redisClient.scard('fans:userid:' + user._id, function(err, count) {
                    if (err) {
                        done('查询粉丝人数错误');
                    } else {
                        done(null, count);
                    }
                });
            },
            /**
             *  得到用户关注的用户
             */
            starsArr: function (done) {
                redisClient.smembers('stars:userid:' + user._id, function (err, result) {
                    if (err) {
                        done('查询关注用户错误');
                    } else {
                        starsArr = result;
                        done(null, result);
                    }
                });
            },
            /**
             *  得到最新注册的用户（不包括自己的）
             */
            latestreguserlink: function(done) {
                var userList = [];
                var userObj = null;
                redisClient.lrange('latestreguserlink', 0, -1, function(err, results) {
                    async.forEachSeries(results, function(item, done) {
                        if (item != user._id && starsArr.indexOf(item) < 0) {
                            redisClient.multi([
                                ['get', 'users:userid:' + item + ':username'],
                                ['get', 'users:userid:' + item + ':avatar'],
                                ['get', 'users:userid:' + item + ':createTime']
                            ]).exec(function(err, results) {
                                if (err) {
                                    done('拉取最新注册用户失败');
                                }
                                userObj = {};
                                if (results[0]) {
                                    userObj._id = item;
                                    userObj.username = results[0];
                                    if (results[1] == '/images/defaultAvatar.png') {
                                        userObj.avatar = '/images/ife_userDefaultAvatar_little.gif';
                                    } else {
                                        userObj.avatar = results[1];
                                    }
                                    userObj.createTime = new Date(results[2]);
                                    userList.push(userObj);
                                }
                                userObj = null;
                                done(null);
                            });
                        } else {
                            done(null);
                        }
                    }, function(err) {
                        if (err) {
                            done(err);
                        } else {
                            done(null, userList);
                        }
                    });
                });
            }
        }, function(err, results) {
            res.render('pages/ife_index/ife_index', {
                username: user.username,
                avatar: user.avatar,
                avatarFlag: user.avatarFlag,
                userid: user._id,
                latestreguserlink: results.latestreguserlink,
                stars: results.stars,
                fans: results.fans
            });
        });
    }
});

router.get('/login', function(req, res, next) {
    res.render('pages/ife_valitor');
});


module.exports = router;
