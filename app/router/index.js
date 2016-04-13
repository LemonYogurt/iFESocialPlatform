var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
	var session = req.session;
	if (!req.session.user) {
		res.render('pages/valitor');
	} else {
		res.render('pages/ife_userHomePage', {
			username: session.user.username,
			avatar: session.user.avatar,
			createTime: session.user.createTime,
			avatarFlag: session.user.avatarFlag,
			_id: session.user._id
		});
	}
});

router.get('/weibo01', function (req, res, next) {
	res.render('pages/ife_userHomePage', {
		createTime: '三天前',
		username: 'oCupJS'
	});
});

module.exports = router;