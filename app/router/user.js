var express = require('express');
var formidable = require('formidable');
var uuid = require('uuid');
var fs = require('fs');
var path = require('path');
/**
 * 这个库是专门为密码存储设计的算法
 * 主要是用它生成一个随机的盐，然后将密码和这个盐混合进来加密，就拿到最终要存储的密码
 */
var bcrypt = require('bcryptjs');
var User = require('../models/user');
// 设置生成盐的复杂程度
var SALT_WORK_FACTOR = 10;

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
router.post('/register', function (req, res, next) {
	new formidable.IncomingForm().parse(req, function (err, fields, files) {
		var username = fields.username;
		var password = fields.password;

		User.findOne({username: username}, function (err, doc) {
			if (err) {
				console.log(err);
				return res.status(403).json('用户查询失败');
			}
			if (doc) {
				return res.status(403).json('用户已存在');
			} else {
				/**
				 * 生成一个随机的盐
				 * 两个参数：
				 * ①：计算强度
				 * ②：回调函数，在回调函数中能够拿到生成的盐
				 */
				bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
					if (err) {
						console.log(err);
						return res.status(403).json('用户注册失败');
					}

					// 使用hash方法将密码和盐进行混合加密
					bcrypt.hash(password, salt, function (err, hash) {
						if (err) {
							console.log(err);
							return res.status(403).json('用户注册失败');
						} else {
							password = hash;
							var user = new User({
								username: username,
								password: password,
								avatar: '/images/defaultAvatar.png',
								avatarFlag: false,
								createTime: new Date()
							});
							user.save(function (err, doc) {
								if (err) {
									console.log(err);
									return res.status(403).json('用户注册失败');
								} else {
									req.session.user = doc;
									return res.status(200).json('用户注册成功，正在跳转页面...');
								}
							});
						}
					});
				});
			}
		});
	});
});

module.exports = router;