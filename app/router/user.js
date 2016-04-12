var express = require('express');
var formidable = require('formidable');
var User = require('../models/user');
var router = express.Router();

router.get('/logout', function (req, res, next) {
	delete req.session.user;
});
router.post('/login', function (req, res, next) {
	new formidable.IncomingForm().parse(req, function (err, fields, files) {
		var username = fields.username;
		var password = fields.password;

		User.findOne({username: username}, function (err, doc) {
			if (err) {
				return res.json(403, '用户查询失败');
			}

			if (!doc) {
				return res.json(403, '该用户不存在!!!');
			} else {
				doc.comparePassword(password, function (err, isMatch) {
					if (err) {
						return res.json(403, '密码比对失败');
					}
					if (isMatch) {
						req.session.user = doc;
						return res.redirect('/');
					} else {
						return res.json(403, '密码不正确');
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
				return res.json(403, '用户查询失败');
			}
			if (doc) {
				return res.json(403, '用户已存在');
			} else {
				var user = new User({
					username: username,
					password: password
				});
				user.save(function (err, doc) {
					if (err) {
						return res.json(403, '用户添加失败');
					} else {
						console.log(doc);
					}
				});
			}
		});
	});
});

module.exports = router;