var express = require('express');
var formidable = require('formidable');
var uuid = require('uuid');
var fs = require('fs');
var path = require('path');
var async = require('async');
var ObjectId = require('bson').ObjectId;

var encrypt = require('../util/encrypt');
var User = require('../models/user');
var redisClient = require('../config').redisClient;

var router = express.Router();

router.post('/avatarUpload', function (req, res, next) {
	new formidable.IncomingForm().parse(req, function (err, fields, files) {
		var avatar = files.avatar;
		var avatarName = uuid.v4() + path.extname(avatar.name);
		fs.createReadStream(avatar.path).pipe(fs.createWriteStream('./public/upload/' + avatarName));

		// 更新数据库
		var update = {$set: {avatar: '/upload/' + avatarName}};
		console.log(req.session.user.username);
		User.findOne({username: req.session.user.username}, function (err, doc) {
			if (err) {
				console.log(err);
				return res.status(403).json('服务器保存失败');
			} else {
				doc.avatar = '/upload/' + avatarName;
				console.log(doc.avatarFlag);
				doc.avatarFlag = true;
				doc.save(function (err, doc) {
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

router.get('/logout', function (req, res, next) {
	delete req.session.user;
	res.redirect('/');
});
router.post('/login', function (req, res, next) {
	new formidable.IncomingForm().parse(req, function (err, fields, files) {
		var username = fields.username;
		var password = fields.password;

		

		User.findOne({username: username}, function (err, doc) {
			if (err) {
				return res.status(403).json('用户查询失败');
			}

			if (!doc) {
				return res.status(403).json('该用户不存在!!!');
			} else {
				doc.comparePassword(password, function (err, isMatch) {
					if (err) {
						return res.status(403).json('密码比对失败');
					}
					if (isMatch) {
						req.session.user = doc;
						return res.status(200).json('用户登录成功，正在跳转页面...');
					} else {
						return res.status(403).json('密码不正确');
					}
				});
			}
		});
	});
});

// 注册
router.post('/register', function (req, res, next) {
	new formidable.IncomingForm().parse(req, function (err, fields, files) {
		var username = fields.username;
		console.log(username);
		var password = fields.password;
		async.series({
			findUser: function (done) {
				// 先在redis中查询
				redisClient.get('users:username:' + username + ':_id', function (err, result) {
					if (err) {
						console.log('redis get', err);
						done(err);
					}
					// 如果没有查到，则返回null
					if (result) {
						done('用户已存在');
					} else {
						// 此时redis中没有查到用户，所以要在mongodb中查询
						User.findOne({username: username}, function (err, doc) {
							if (err) {
								console.log('findOne', err);
								done(err);
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
								]).exec(function (err, result) {
									console.log('multi1', err);
									done('用户已存在');
								});
							} else {
								// 如果没有查询到，则进行注册
								// 1：对密码进行加密
								encrypt(password, function (hash) {
									var password = hash;
									var _id = new ObjectId().toString();
									var avatar = '/images/defaultAvatar.png';
									var avatarFlag = false;
									var createTime = new Date();

									redisClient.multi([
										['set', 'users:_id:' + _id + ':username', username],
										['set', 'users:_id:' + _id + ':password', password],
										['set', 'users:_id:' + _id + ':avatar', avatar],
										['set', 'users:_id:' + _id + ':createTime', createTime],
										['set', 'users:_id:' + _id + ':avatarFlag', avatarFlag],
										['set', 'users:username:' + username + ':_id', _id]
									]).exec(function (err, result) {
										console.log('multi2', err);
										var user = new User({
											_id: _id,
											username: username,
											password: hash,
											avatar: avatar,
											avatarFlag: avatarFlag,
											createTime: createTime
										});
										user.save(function (err, doc) {
											if (err) {
												console.log('save', err);
												done('用户注册失败');
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
		}, function (err, results) {
			if (err) {
				console.log(err);
				return res.status(403).json('用户注册失败');
			} else {
				console.log(results);
				return res.status(200).json('用户注册成功');
			}
		});
	});
});

module.exports = router;