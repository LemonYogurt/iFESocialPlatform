var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
	if (!req.session.user) {
		res.render('pages/valitor');
	} else {
		res.render('pages/index');
	}
});

router.get('/weibo01', function (req, res, next) {
	res.render('pages/weibo01', {
		createTime: '三天前'
	});
});

module.exports = router;