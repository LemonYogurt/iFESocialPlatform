var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
	var session = req.session;
	if (!req.session.user) {
		res.render('pages/ife_valitor');
	} else {
		res.render('pages/ife_index/ife_index', {

		});
	}
});

router.get('/login', function (req, res, next) {
	res.render('pages/ife_valitor');
});


module.exports = router;