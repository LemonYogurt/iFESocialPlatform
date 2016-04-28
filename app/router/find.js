var express = require('express');
var async = require('async');
var getUserCompleteInfo = require('../util/getUserCompleteInfo');
var redisClient = require('../config').redisClient;
var router = express.Router();

router.get('/', function(req, res, next) {
    var session = req.session;
    var user = session.user;
    /**
     *  SideBody数据
     */
    // 存放关注id
    var starsArr = [];
    // 保存当前用户的文章数
    var currentUserArticleNum = 0;
    var latestreguserlinkid = [];
    var latestreguserlinkUser = [];
    var starids = [];
    if (!session.user) {
        res.render('pages/ife_valitor');
    } else {
        if (user.avatar == '/images/defaultAvatar.png') {
            user.avatar = '/images/ife_userDefaultAvatar_little.gif';
        }
        async.series({
            /*
             * 得到侧边栏的数据
             */
            stars: function(done) {
                redisClient.scard('stars:userid:' + user._id, function(err, count) {
                    if (err) {
                        done({msg: '查询关注人数错误'});
                    } else {
                        done(null, count);
                    }
                });
            },
            fans: function(done) {
                redisClient.scard('fans:userid:' + user._id, function(err, count) {
                    if (err) {
                        done({msg: '查询粉丝人数错误'});
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
                        if (result) {
                            starsArr = result;
                        } else {
                            starsArr = [];
                        }
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
                // 查询出最新注册的用户
                redisClient.lrange('latestreguserlink', 0, -1, function(err, results) {
                    latestreguserlinkid = results;
                    async.forEachSeries(results, function(item, done) {
                        // 如果不是当前用户并且不是已经关注的用户
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
                                // 如果用户名存在
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
            },
            getCurrentPostNum: function (done) {
                redisClient.get('currentpostnum:userid:' + user._id, function (err, result) {
                    if (err) {
                        done({msg: '得到当前用户发布文章数量失败'});
                    } else {
                        currentUserArticleNum = result;
                        done(null, result);
                    }
                });
            },
            getStarsUserInfo: function (done) {
                async.forEachSeries(latestreguserlinkid, function (item, done) {
                    getUserCompleteInfo(item, function (err, user) {
                        if (err) {
                            done(err);
                        } else {
                            latestreguserlinkUser.push(user);
                            done(null);
                        }
                    });
                }, function (err) {
                    if (err) {
                        done(err);
                    } else {
                        done(null);
                    }
                });
            },
            getStarsId: function (done) {
                redisClient.smembers('stars:userid:' + user._id, function (err, results) {
                    if (err) {
                        done({msg: '查询关注者集合失败'});
                    } else {
                        starids = results;
                        done(null, results);
                    }
                });
            }
        }, function(err, results) {
            if (err) {
                return res.status(403).json(err);
            } else {
                res.render('pages/ife_find/ife_find', {
                    // 用户名 头像 头像
                    username: user.username,
                    avatar: user.avatar,
                    userid: user._id,

                    // 中间的数据
                    latestreguserlinkUser: latestreguserlinkUser,
                    starids: starids,
                    /*
                     * 得到侧边栏的数据
                     */
                    // 返回最新注册的用户（数组，保存的是用户对象）
                    latestreguserlink: results.latestreguserlink,
                    stars: results.stars,
                    fans: results.fans,
                    currentUserArticleNum: currentUserArticleNum
                });
            }
        });
    }
});
module.exports = router;