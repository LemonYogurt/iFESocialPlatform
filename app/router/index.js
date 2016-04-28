var express = require('express');
var async = require('async');
var getArticleInfo = require('../util/getArticleInfo');
var redisClient = require('../config').redisClient;
var router = express.Router();


// 在首页查询的时候，
// ①：将自己的明星key查出来，把自己的id也加进去
// ②：根据查询出来的这些用户id数组，获取用户上次的拉取点
// ③：根据上次的拉取点，获取文章id
// 保存新的拉取点
// ④：将获取到的文章id排序存储到当前用户展示的链表中
// ⑤：根据链表中的文章的id，查询出文章
// ⑥：根据文章id查询出文章中的commentsid数组
// ⑦：根据commentsid数组查询出主评论
// ⑧：根据每一条主评论中的reply数组，查询出下面的replycomment内容
// ⑨：查询出当前自己发表的文章数
router.get('/', function(req, res, next) {
    var session = req.session;
    var user = session.user;
    /**
     *  SideBody数据
     */
    // 存放关注id
    var starsArr = [];
    /**
     *  mainBody数据
     */ 
    // 需要拉取的用户id
    var needPullUseid = [];
    // 上次的拉取点
    // 其实拉取点只要设置成时间戳
    var lastPullPoint = 0;
    // 用于保存拉取的文章列表
    var pullArticleListId = [];
    // 存储完整的文章
    var completeArticle = [];
    // 首页需要显示的文章id
    var indexArticleListId = [];
    // 保存当前用户的文章数
    var currentUserArticleNum = 0;

    if (!session.user) {
        res.render('pages/ife_valitor');
    } else {
        if (user.avatar == '/images/defaultAvatar.png') {
            user.avatar = '/images/ife_userDefaultAvatar_little.gif';
        }
        // 将自己的_id加进去
        needPullUseid.push(user._id);
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
                            // 将关注的用户id和自己的id进行保存
                            for (var i = 0; i < result.length; i++) {
                                needPullUseid.push(result[i]);
                            }
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
            // 获取上次的拉取点
            getLastPullPoint: function (done) {
                redisClient.get('lastpullpoint:userid:' + user._id, function (err, result) {
                    if (err) {
                        done({msg: '获取上次的拉取点失败'});
                    }
                    if (result) {
                        lastPullPoint = result;
                        done(null, result);    
                    } else {
                        lastPullPoint = 0;
                        done(null);
                    }
                });
            },
            // 根据拉取点获取用户文章的id
            getNeedPullArticleId: function (done) {
                var newPullPoint = Date.now();
                console.log('needPullUseid');
                for (var i = 0; i < needPullUseid.length; i++) {
                    console.log(needPullUseid[i]);
                }
                async.forEachSeries(needPullUseid, function (item, done) {
                    redisClient.zrangebyscore('fanspost:userid:' + item, parseInt(lastPullPoint) + 1, newPullPoint, function (err, result) {
                        if (err) {
                            done({msg: '文章id拉取失败'});
                        }
                        if (result && result.length > 0) {
                            pullArticleListId = pullArticleListId.concat(result);
                        }
                        done(null);
                    });
                }, function (err) {
                    if (err) {
                        done(err);
                    } else {
                        lastPullPoint = newPullPoint;
                        console.log('pullArticleListId: ', pullArticleListId);
                        done(null);
                    }
                });
            },
            // 设置本次的拉取点
            setLastPullPoint: function (done) {
                redisClient.set('lastpullpoint:userid:' + user._id, lastPullPoint, function (err, result) {
                    if (err) {
                        done({msg: '设置上次的拉取点失败'});
                    }
                    done(null, result);
                });
            },
            delHomePost: function (done) {
                redisClient.lrange('index:userid:' + user._id, 0, -1, function (err, result) {
                    if (err) {
                        done({msg: '查询当前首页文章失败'});
                    } else {
                        if (result.length > 0) {
                            async.forEachSeries(result, function (item, done) {
                                redisClient.hgetall('article:articleid:' + item, function(err, result) {
                                    if (err) {
                                        done({ msg: 'index链表查询文章失败' });
                                    } else {
                                        // 如果文章不存在，则进行删除
                                        if (!result) {
                                            redisClient.lrem('index:userid:' + user._id, 1, item, function (err, result) {
                                                if (err) {
                                                    done({msg: '删除失败'});
                                                } else {
                                                    done(null);
                                                }
                                            });
                                        } else {
                                            done(null);
                                        }
                                    }
                                });
                            }, function (err) {
                                if (err) {
                                    done(err);
                                } else {
                                    done(null);
                                }
                            });
                        } else {
                            done(null, result);
                        }
                    }
                });
            },
            // 保存到index的post中
            saveHomePost: function (done) {
                if (pullArticleListId.length != 0) {
                    redisClient.lpush('index:userid:' + user._id, pullArticleListId, function (err, result) {
                        if (err) {
                            done({msg: '保存首页文章失败'});
                        } else {
                            done(null, result);
                        }
                    });
                } else {
                    done(null);
                }
            },
            // 在截取59条
            ltrimIndexArticleId: function (done) {
                redisClient.ltrim('index:userid:' + user._id, 0, 59, function (err, result) {
                    if (err) {
                        done({msg: '查询当前首页文章失败'});
                    } else {
                        done(null);
                    }
                });
            },
            // 
            getIndexArticleListId: function (done) {
                // indexArticleListId
                redisClient.lrange('index:userid:' + user._id, 0, -1, function (err, result) {
                    if (err) {
                        done({msg: '查询当前首页文章失败'});
                    } else {
                        if (result.length > 0) {
                            indexArticleListId = result;
                            done(null, result);
                        } else {
                            done(null, result);
                        }
                    }
                });
            },
            // 得到完整的文章
            getCompleteArticle: function (done) {
                async.forEachSeries(indexArticleListId, function (item, done) {
                    getArticleInfo(item, function(err, article) {
                        if (err) {
                            done(err);
                        } else {
                            completeArticle.push(article);
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
            getCurrentPostNum: function (done) {
                redisClient.get('currentpostnum:userid:' + user._id, function (err, result) {
                    if (err) {
                        done({msg: '得到当前用户发布文章数量失败'});
                    } else {
                        currentUserArticleNum = result;
                        done(null, result);
                    }
                });
            }
        }, function(err, results) {
            if (err) {
                return res.status(403).json(err);
            } else {
                completeArticle.sort(function (a, b) {
                    return new Date(b.createAt) - new Date(a.createAt);
                });

                for (var i = 0; i < completeArticle.length; i++) {
                    completeArticle[i].comments.sort(function (a, b) {
                        return new Date(a.createAt) - new Date(b.createAt);
                    });
                    for (var j = 0; j < completeArticle[i].comments.length; j++) {
                        completeArticle[i].comments[j].scomments.sort(function (a, b) {
                            return new Date(a.createAt) - new Date(b.createAt);
                        });
                    }
                }
                res.render('pages/ife_index/ife_index', {
                    username: user.username,
                    avatar: user.avatar,
                    avatarFlag: user.avatarFlag,
                    userid: user._id,
                    /*
                     * 得到文章的数据
                     */
                    completeArticle: completeArticle,
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

router.get('/chat', function(req, res, next) {
    if (!req.session.user) {
        res.render('pages/ife_valitor');
    } else {
        var user = req.session.user;
        res.render('pages/ife_chat/ife_chat', {
            username: user.username,
            userid: user._id,
            avatar: user.avatar
        });
    }
});

module.exports = router;