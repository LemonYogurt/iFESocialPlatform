var express = require('express');
var formidable = require('formidable');
var uuid = require('uuid');
var fs = require('fs');
var path = require('path');
var async = require('async');
var bcrypt = require('bcryptjs');
var ObjectId = require('bson').ObjectId;

var encrypt = require('../util/encrypt');
var redisClient = require('../config').redisClient;

var User = require('../models/user');
var router = express.Router();

router.post('/avatarUpload', function(req, res, next) {
    new formidable.IncomingForm().parse(req, function(err, fields, files) {
        var avatar = files.avatar;
        var avatarName = uuid.v4() + path.extname(avatar.name);
        var rs = fs.createReadStream(avatar.path);
        var user = req.session.user;
        async.series({
            uploadPic: function (done) {
                rs.pipe(fs.createWriteStream('./public/upload/' + avatarName));
                rs.on('end', function() {
                    done(null, {msg: '上传头像成功'});
                });
            },
            updateRedis: function (done) {
                redisClient.set('users:userid:' + user._id + ':avatarFlag', true, function (err, result) {
                    if (err) {
                        done({msg: 'redis设置头像flag失败'});
                    } else {
                        done(null, result);
                    }
                });
            },
            updateRedisAvatar: function (done) {
                redisClient.set('users:userid:' + user._id + ':avatar', '/upload/' + avatarName, function (err, result) {
                    if (err) {
                        done({msg: 'redis设置头像失败'});
                    } else {
                        done(null, result);
                    }
                });
            },
            updateMongo: function (done) {
                var update = { $set: { avatar: '/upload/' + avatarName } };
                User.findOne({ username: req.session.user.username }, function(err, doc) {
                    if (err) {
                        done({msg: '服务器查询失败'});
                    } else {
                        doc.avatar = '/upload/' + avatarName;
                        doc.avatarFlag = true;
                        doc.save(function(err, doc) {
                            if (err) {
                                done({msg: '服务器保存失败'});
                            } else {
                                req.session.user = doc;
                                done(null);
                            }
                        });
                    }
                });
            }
        }, function (err, results) {
            if (err) {
                return res.status(403).json(err);
            } else {
                return res.status(200).json({msg: '上传头像成功'});
            }
        });
    });
});

// 取消关注
router.delete('/cancelStars', function (req, res, next) {
    var userid = req.body.userid;
    var articleArr = [];
    async.series({
        delStars: function (done) {
            redisClient.srem('stars:userid:' + req.session.user._id, userid, function(err, result) {
                if (err) {
                    done({ msg: '取消关注失败' });
                }
                done(null);
            });
        },
        delFans: function (done) {
            redisClient.srem('fans:userid:' + userid, req.session.user._id, function (err, result) {
                if (err) {
                    done({msg: '取消关注失败'});
                } else {
                    done(null);
                }
            });
        },
        //点击取消关注之后，要把当前首页中保存的文章给删除掉
        delIndexArticle: function (done) {
            redisClient.lrange('index:userid:' + req.session.user._id, 0, -1, function (err, results) {
                if (err) {
                    done({msg: '查询文章id失败'});
                } else {
                    articleArr = results;
                    if (articleArr && articleArr.length > 0) {
                        async.forEachSeries(articleArr, function (item, done) {
                            getArticle(item, function (err, article) {
                                if (err) {
                                    done(err);
                                } else {
                                    if (article && article.userid == userid) {
                                        redisClient.lrem('index:userid:' + req.session.user._id, 1, item, function (err, result) {
                                            if (err) {
                                                done({msg: '删除文章id失败'});
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
                        done(null);
                    }
                }
            });
        }
    }, function (err, results) {
        if (err) {
            return res.status(403).json(err);
        } else {
            return res.status(200).json({msg: '取消关注成功'});
        }
    });
});

// 关注功能完成
// 添加关注的时候，给stars:userid无序集合添加，也给fans:userid添加
// 添加成功后，之后就拉取关注者的文章，放到当前用户的index链表中，以0 - 当前的时间戳为基准
router.post('/stars', function(req, res, next) {
    new formidable.IncomingForm().parse(req, function(err, fields, files) {
        var starsid = fields.userid;
        var user = req.session.user;
        // 用于保存关注者的文章id列表
        var starsArticleIdList = [];
        async.series({
            // 添加关注集合
            saddStars: function(done) {
                redisClient.sadd('stars:userid:' + user._id, starsid, function(err, result) {
                    if (err) {
                        done({ msg: '关注失败' });
                    }
                    done(null);
                });
            },
            // 添加粉丝集合
            saddFans: function(done) {
                redisClient.sadd('fans:userid:' + starsid, user._id, function (err, result) {
                    if (err) {
                        done({msg: '关注失败'});
                    } else {
                        done(null);
                    }
                });
            },
            // 准备拉取关注者的文章id
            getStarsArticleId: function (done) {
                var newPullPoint = Date.now();
                redisClient.zrangebyscore('fanspost:userid:' + starsid, 0, Date.now(), function (err, result) {
                    if (err) {
                        done({msg: '关注者文章id拉取失败'});
                    }
                    if (result && result.length > 0) {
                        starsArticleIdList = result;
                    }
                    done(null, result);
                });
            },
            saveHomePost: function (done) {
                if (starsArticleIdList.length != 0) {
                    redisClient.lpush('index:userid:' + user._id, starsArticleIdList, function (err, result) {
                        if (err) {
                            done({msg: '保存首页文章失败'});
                        } else {
                            done(null, result);
                        }
                    });
                } else {
                    done(null);
                }
            }
        }, function(err, results) {
            if (err) {
                return res.status(403).json(err);
            }
            return res.status(200).json({msg:'关注成功'});
        });

    });
});

/**
 *  用户的登录 注册 退出
 */

// 退出（完成）
router.get('/logout', function(req, res, next) {
    delete req.session.user;
    res.redirect('/');
});

// 登录（完成）
router.post('/login', function(req, res, next) {
    new formidable.IncomingForm().parse(req, function(err, fields, files) {
        var username = fields.username;
        var password = fields.password;
        var _id = '';
        // 首先是根据用户名查询出用户的_id
        // 之后是根据用户的_id查询出用户的密码
        // 然后进行比对
        async.series({
            findUser: function(done) {
                // 根据用户名查询出用户_id
                redisClient.get('users:username:' + username + ':userid', function(err, result) {
                    if (err) {
                        done({ msg: '查询失败' });
                    } else {
                        // 如果查询出_id，则开始查密码
                        if (result) {
                            _id = result;
                            redisClient.get('users:userid:' + _id + ':password', function(err, result) {
                                if (err) {
                                    done({ msg: '查询失败' });
                                } else {
                                    // 如果查询出密码，则进行比对
                                    if (result) {
                                        bcrypt.compare(password, result, function(err, isMatch) {
                                            if (err) {
                                                done({ msg: '密码比对失败' });
                                            } else {
                                                // 表示密码匹配成功
                                                if (isMatch) {
                                                    // 查询出其他内容
                                                    password = result;
                                                    redisClient.multi([
                                                        ['get', 'users:userid:' + _id + ':avatar'],
                                                        ['get', 'users:userid:' + _id + ':createTime'],
                                                        ['get', 'users:userid:' + _id + ':avatarFlag']
                                                    ]).exec(function(err, results) {
                                                        if (err) {
                                                            done({ msg: '用户信息查询失败' });
                                                        } else {
                                                            req.session.user = {
                                                                _id: _id,
                                                                username: username,
                                                                password: password,
                                                                avatar: results[0],
                                                                createTime: results[1],
                                                                avatarFlag: results[2]
                                                            };
                                                            done(null, { msg: '登录成功' });
                                                        }
                                                    });
                                                }
                                            }
                                        });
                                    }
                                }
                            });
                        } else {
                            User.findOne({ username: username }, function(err, doc) {
                                if (err) {
                                    done({ msg: '用户查询失败' });
                                } else {
                                    if (doc) {
                                        bcrypt.compare(password, doc.password, function(err, isMatch) {
                                            if (err) {
                                                done({ msg: '密码比对失败' });
                                            } else {
                                                if (isMatch) {
                                                    // 如果查询到，则将没有缓存的内容缓存起来
                                                    redisClient.multi([
                                                        ['set', 'users:userid:' + doc._id + ':username', doc.username],
                                                        ['set', 'users:userid:' + doc._id + ':password', doc.password],
                                                        ['set', 'users:userid:' + doc._id + ':avatar', doc.avatar],
                                                        ['set', 'users:userid:' + doc._id + ':createTime', doc.createTime],
                                                        ['set', 'users:userid:' + doc._id + ':avatarFlag', doc.avatarFlag],
                                                        ['set', 'users:username:' + doc.username + ':userid', doc._id]
                                                    ]).exec(function(err, result) {
                                                        if (err) {
                                                            done({ msg: '用户缓存失败' });
                                                        } else {
                                                            req.session.user = doc;
                                                            done(null, { msg: '登录成功' });
                                                        }
                                                    });
                                                } else {
                                                    done({ msg: '密码错误' });
                                                }
                                            }
                                        });
                                    } else {
                                        done({ msg: '用户不存在' });
                                    }
                                }
                            });
                        }
                    }
                });
            }
        }, function(err, results) {
            if (err) {
                return res.status(403).json(err);
            }
            return res.status(200).json({ msg: '用户登录成功' });
        });
    });
});

// 注册（完成）
router.post('/register', function(req, res, next) {
    new formidable.IncomingForm().parse(req, function(err, fields, files) {
        var username = fields.username;
        var password = fields.password;
        async.series({
            findUser: function(done) {
                // 先在redis中查询
                redisClient.get('users:username:' + username + ':userid', function(err, result) {
                    if (err) {
                        console.log(err);
                        done({ msg: '用户查询失败' });
                    }
                    // 如果没有查到，则返回null
                    if (result) {
                        done({ msg: '用户已存在' });
                    } else {
                        // 此时redis中没有查到用户，所以要在mongodb中查询
                        User.findOne({ username: username }, function(err, doc) {
                            if (err) {
                                done({ msg: '用户查询失败' });
                            }
                            // 如果没有查到，返回null
                            if (doc) {
                                // 如果查询到，则将没有缓存的内容缓存起来
                                redisClient.multi([
                                    ['set', 'users:userid:' + doc._id + ':username', doc.username],
                                    ['set', 'users:userid:' + doc._id + ':password', doc.password],
                                    ['set', 'users:userid:' + doc._id + ':avatar', doc.avatar],
                                    ['set', 'users:userid:' + doc._id + ':createTime', doc.createTime],
                                    ['set', 'users:userid:' + doc._id + ':avatarFlag', doc.avatarFlag],
                                    ['set', 'users:username:' + doc.username + ':userid', doc._id]
                                ]).exec(function(err, result) {
                                    if (err) {
                                        done({ msg: '用户缓存失败' });
                                    }
                                    done({ msg: '用户已存在' });
                                });
                            } else {
                                // 如果没有查询到，则进行注册
                                // 1：对密码进行加密
                                encrypt(password, function(hash) {
                                    var _id = new ObjectId().toString();
                                    var avatar = '/images/defaultAvatar.png';
                                    var avatarFlag = false;
                                    var createTime = new Date();

                                    redisClient.multi([
                                        ['set', 'users:userid:' + _id + ':username', username],
                                        ['set', 'users:userid:' + _id + ':password', hash],
                                        ['set', 'users:userid:' + _id + ':avatar', avatar],
                                        ['set', 'users:userid:' + _id + ':createTime', createTime],
                                        ['set', 'users:userid:' + _id + ':avatarFlag', avatarFlag],
                                        ['set', 'users:username:' + username + ':userid', _id]
                                    ]).exec(function(err, result) {
                                        if (err) {
                                            done({ msg: '用户注册失败' });
                                            console.log('multi2', err);
                                        }

                                        var user = new User({
                                            _id: _id,
                                            username: username,
                                            password: hash,
                                            avatar: avatar,
                                            avatarFlag: avatarFlag,
                                            createTime: createTime
                                        });
                                        user.save(function(err, doc) {
                                            if (err) {
                                                console.log('save', err);
                                                done({ msg: '用户注册失败' });
                                            } else {
                                                req.session.user = doc;
                                                // 注册成功后，维护最新注册用户的链表
                                                redisClient.lpush('latestreguserlink', doc._id, function(err, count) {
                                                    if (err) {
                                                        done('最新用户添加链表失败');
                                                    }
                                                    // 最新用户的链表只最多维护25个（如果去掉自身的一个就是24，页面可以一次可以显示6个）
                                                    redisClient.ltrim('latestreguserlink', 0, 24, function(err, result) {
                                                        if (err) {
                                                            done('链表截取失败');
                                                        }
                                                    });
                                                });
                                                done(null, doc);
                                            }
                                        });
                                    });
                                });
                            }
                        });
                    }
                });
            }
        }, function(err, results) {
            if (err) {
                return res.status(403).json(err);
            } else {
                return res.status(200).json({ msg: '用户注册成功' });
            }
        });
    });
});

function getArticle(articleid, cb) {
    redisClient.hgetall('article:articleid:' + articleid, function(err, result) {
        if (err) {
            console.log(err);
        }
        cb(err, result);
    });
}

module.exports = router;
