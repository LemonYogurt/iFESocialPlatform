var express = require('express');
var formidable = require('formidable');
var uuid = require('uuid');
var fs = require('fs');
var path = require('path');
var async = require('async');
var bcrypt = require('bcryptjs');
var ObjectId = require('bson').ObjectId;

var encrypt = require('../util/encrypt');
var User = require('../models/user');
var redisClient = require('../config').redisClient;

var router = express.Router();

router.post('/avatarUpload', function(req, res, next) {
    new formidable.IncomingForm().parse(req, function(err, fields, files) {
        var avatar = files.avatar;
        var avatarName = uuid.v4() + path.extname(avatar.name);
        fs.createReadStream(avatar.path).pipe(fs.createWriteStream('./public/upload/' + avatarName));

        // 更新数据库
        var update = { $set: { avatar: '/upload/' + avatarName } };
        console.log(req.session.user.username);
        User.findOne({ username: req.session.user.username }, function(err, doc) {
            if (err) {
                console.log(err);
                return res.status(403).json('服务器保存失败');
            } else {
                doc.avatar = '/upload/' + avatarName;
                console.log(doc.avatarFlag);
                doc.avatarFlag = true;
                doc.save(function(err, doc) {
                    if (err) {
                        console.log(err);
                        return res.status(403).json('服务器保存失败');
                    } else {
                        req.session.user = doc;
                        return res.status(200).json('服务器保存成功');
                    }
                });
            }
        });

    });
});

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
        console.log(username, password);
        // 首先是根据用户名查询出用户的_id
        // 之后是根据用户的_id查询出用户的密码
        // 然后进行比对
        async.series({
            findUser: function(done) {
                // 根据用户名查询出用户_id
                redisClient.get('users:username:' + username + ':_id', function(err, result) {
                	console.log('redis', result);
                    if (err) {
                        console.log('findUser', err);
                        done({msg: '查询失败'});
                    } else {
                        // 如果查询出_id，则开始查密码
                        if (result) {
                        	_id = result;
                            redisClient.get('users:_id:' + _id + ':password', function(err, result) {
                                if (err) {
                                    console.log('findUser', err);
                                    done({msg: '查询失败'});
                                } else {
                                    // 如果查询出密码，则进行比对
                                    console.log('pwd', result);
                                    if (result) {
                                    	console.log(password,'::::', result);
                                        bcrypt.compare(password, result, function(err, isMatch) {
                                            if (err) {
                                            	console.log('密码比对失败');
                                                done({msg: '密码比对失败'});
                                            } else {
                                            	// 表示密码匹配成功
                                            	console.log('isMatch', isMatch);
                                                if (isMatch) {
                                                	// 查询出其他内容
                                                	password = result;
                                                	redisClient.multi([
			                                        	['get', 'users:_id:' + _id + ':avatar'],
			                                        	['get', 'users:_id:' + _id + ':createTime'],
			                                        	['get', 'users:_id:' + _id + ':avatarFlag']
			                                        ]).exec(function (err, results) {
			                                        	if (err) {
			                                        		console.log('用户信息查询失败');
			                                        		done({msg: '用户信息查询失败'});
			                                        	} else {
			                                        		console.log('multi', results);
			                                        		req.session.user = {
			                                        			_id: _id,
			                                        			username: username,
			                                        			password: password,
			                                        			avatar: results[0],
			                                        			createTime: results[1],
			                                        			avatarFlag: results[2]
			                                        		};
			                                        		console.log(req.session.user);
			                                        		done(null, {msg: '登录成功'});
			                                        	}
			                                        });
                                                }
                                            }
                                        });
                                    }
                                }
                            });
                        } else {
                        	User.findOne({username: username}, function (err, doc) {
                        		if (err) {
                        			done({msg: '用户查询失败'});
                        		} else {
                        			if (doc) {
                        				bcrypt.compare(password, doc.password, function(err, isMatch) {
                        					if (err) {
                        						done({msg: '密码比对失败'});
                        					} else {
                        						if (isMatch) {
                        							// 如果查询到，则将没有缓存的内容缓存起来
					                                redisClient.multi([
					                                    ['set', 'users:_id:' + doc._id + ':username', doc.username],
					                                    ['set', 'users:_id:' + doc._id + ':password', doc.password],
					                                    ['set', 'users:_id:' + doc._id + ':avatar', doc.avatar],
					                                    ['set', 'users:_id:' + doc._id + ':createTime', doc.createTime],
					                                    ['set', 'users:_id:' + doc._id + ':avatarFlag', doc.avatarFlag],
					                                    ['set', 'users:username:' + doc.username + ':_id', doc._id]
					                                ]).exec(function(err, result) {
					                                    if (err) {
					                                        done({msg: '用户缓存失败'});
					                                    } else {
					                                    	console.log('开始设置session');
					                                    	req.session.user = doc;
					                                    	done(null, {msg: '登录成功'});
					                                    }
					                                });
                        						} else {
                        							done({msg: '密码错误'});
                        						}
                        					}
                        				});
                        			} else {
                        				done({msg: '用户不存在'});
                        			}
                        		}
                        	});
                        }
                    }
                });
            }
        }, function(err, results) {
        	if (err) {
        		console.log('async 出现了error')
        		return res.status(403).json(err);
        	}
        	console.log(results);
        	return res.status(200).json({msg: '用户登录成功'});
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
                redisClient.get('users:username:' + username + ':_id', function(err, result) {
                    if (err) {
                        console.log(err);
                        done({msg: '用户查询失败'});
                    }
                    // 如果没有查到，则返回null
                    if (result) {
                        done({msg:'用户已存在'});
                    } else {
                        // 此时redis中没有查到用户，所以要在mongodb中查询
                        User.findOne({ username: username }, function(err, doc) {
                            if (err) {
                                console.log('findOne', err);
                                done({msg: '用户查询失败'});
                            }
                            // 如果没有查到，返回null
                            if (doc) {
                                // 如果查询到，则将没有缓存的内容缓存起来
                                redisClient.multi([
                                    ['set', 'users:_id:' + doc._id + ':username', doc.username],
                                    ['set', 'users:_id:' + doc._id + ':password', doc.password],
                                    ['set', 'users:_id:' + doc._id + ':avatar', doc.avatar],
                                    ['set', 'users:_id:' + doc._id + ':createTime', doc.createTime],
                                    ['set', 'users:_id:' + doc._id + ':avatarFlag', doc.avatarFlag],
                                    ['set', 'users:username:' + doc.username + ':_id', doc._id]
                                ]).exec(function(err, result) {
                                    if (err) {
                                        done({msg: '用户缓存失败'});
                                    }
                                    done({msg: '用户已存在'});
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
                                        ['set', 'users:_id:' + _id + ':username', username],
                                        ['set', 'users:_id:' + _id + ':password', hash],
                                        ['set', 'users:_id:' + _id + ':avatar', avatar],
                                        ['set', 'users:_id:' + _id + ':createTime', createTime],
                                        ['set', 'users:_id:' + _id + ':avatarFlag', avatarFlag],
                                        ['set', 'users:username:' + username + ':_id', _id]
                                    ]).exec(function(err, result) {
                                        if (err) {
                                            done({msg: '用户注册失败'});
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
                                                done({msg: '用户注册失败'});
                                            } else {
                                                req.session.user = doc;
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
                return res.status(200).json({msg: '用户注册成功'});
            }
        });
    });
});

module.exports = router;
