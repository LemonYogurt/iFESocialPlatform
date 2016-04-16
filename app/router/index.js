var express = require('express');
var router = express.Router();

/*
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
*/

router.get('/login', function (req, res, next) {
	res.render('pages/ife_valitor');
});

router.get('/home', function (req, res, next) {
	res.render('pages/ife_home/ife_home', {
		username: 'Luvjs',
		avatar: '/images/defaultAvatar.png',
		createTime: '2015-09-10',
		avatarFlag: true
	});
});

router.get('/index', function (req, res, next) {
	res.render('pages/ife_index/ife_index', {
		username: 'oCupJS'
	});
});

router.get('/find', function (req, res, next) {
	res.render('pages/ife_find/ife_index', {
		username: 'Luvjs'
	});
})

module.exports = router;