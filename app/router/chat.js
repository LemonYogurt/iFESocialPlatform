var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    if (!req.session.user) {
        res.redirect('/');
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