var express = require('express');
var async = require('async');
var ObjectId = require('bson').ObjectId;
var redisClient = require('../config').redisClient;
var router = express.Router();

// 撤销评论赞
router.post('/cancelReplyPraise', function (req, res, next) {
	var scommentid = req.body.scommentid;
	var from = req.session.user._id;
	var praiseArr = [];
	async.series({
		findReplyComment: function (done) {
			redisClient.hget('replycomment:replycommentid:' + scommentid, 'praise', function (err, result) {
				if (err) {
					done({msg: '查询回复赞失败'});
				}
				if (result) {
					praiseArr = result.split(',');
					praiseArr.splice(praiseArr.indexOf(from), 1);
				}
				done(null, result);
			});
		},
		updateReplyComment: function (done) {
			redisClient.hset('replycomment:replycommentid:' + scommentid, 'praise', praiseArr.toString(), function (err, result) {
				if (err) {
					done({msg: '取消回复赞失败'});
				}
				done(null, result);
			});
		}
	}, function (err, results) {
		if (err) {
			return res.status(403).json(err);
		}
		return res.status(200).json({msg: '取消回复赞成功'});
	});
});

// 为评论点赞
router.post('/addReplyPraise', function (req, res, next) {
	var scommentid = req.body.scommentid;
	var from = req.session.user._id;
	var praiseArr = [];
	praiseArr.push(from);

	async.series({
		findComment: function (done) {
			redisClient.hget('replycomment:replycommentid:' + scommentid, 'praise', function (err, result) {
				if (err) {
					done({msg: '查询回复赞失败'});
				}
				if (result) {
					praiseArr = praiseArr.concat(result.split(','));
				}
				done(null, result);
			});
		},
		updateComment: function (done) {
			redisClient.hset('replycomment:replycommentid:' + scommentid, 'praise', praiseArr.toString(), function (err, result) {
				if (err) {
					done({msg: '添加回复赞失败'});
				}
				done(null, result);
			});
		}
	}, function (err, results) {
		if (err) {
			return res.status(403).json(err);
		}
		return res.status(200).json({msg: '添加回复赞成功'});
	});
});

// 回复评论
router.post('/replyComment', function (req, res, next) {
	var commentid = req.body.commentid;
	var to = req.body.to;
	var content = req.body.content;
	var from = req.session.user._id;
	var createAt = new Date().toString();
	var praise = [].toString();
	var replycommentid = new ObjectId().toString();
	var replyArr = [];
	replyArr.push(replycommentid);

	// 查询出对应的主评论，然后将当前回复的id写入
	async.series({
		findComment: function (done) {
			redisClient.hget('comment:commentid:' + commentid, 'reply', function (err, result) {
				if (err) {
					done({msg: '查询主评论失败'});
				}
				if (result) {
					replyArr = replyArr.concat(result.split(','));
				}
				done(null, result);
			});
		},
		updateComment: function (done) {
			redisClient.hset('comment:commentid:' + commentid, 'reply', replyArr.toString(), function (err, result) {
				if (err) {
					done({msg: '主评论更新失败'});
				}
				done(null, result);
			});
		},
		saveReplyComment: function (done) {
			redisClient.hmset('replycomment:replycommentid:' + replycommentid, ['from', from, 'to', to, 'content', content, 'createAt', createAt, 'commentid', commentid, 'praise', praise], function (err, result) {
				if (err) {
					done({msg: '回复评论保存失败'});
				}
				done(null, result);
			});
		},
		findReplyComment: function (done) {
			redisClient.hgetall('replycomment:replycommentid:' + replycommentid, function (err, result) {
				if (err) {
					done({msg: '回复评论查询失败'});
				}
				done(null, result);
			});
		}
	}, function (err, results) {
		if (err) {
			console.log(err);
			return res.status(403).json(err);
		}
		console.log(results.findReplyComment);
		results.findReplyComment.msg = '回复评论保存成功';
		results.findReplyComment.replycommentid = replycommentid;
		return res.status(200).json(results.findReplyComment)
	});
});

// 撤销赞
router.post('/cancelPraise', function (req, res, next) {
	var commentid = req.body.commentid;
	var from = req.session.user._id;
	var praiseArr = [];
	async.series({
		findComment: function (done) {
			redisClient.hget('comment:commentid:' + commentid, 'praise', function (err, result) {
				if (err) {
					done({msg: '查询评论赞失败'});
				}
				if (result) {
					praiseArr = result.split(',');
					praiseArr.splice(praiseArr.indexOf(from), 1);
				}
				done(null, result);
			});
		},
		updateComment: function (done) {
			redisClient.hset('comment:commentid:' + commentid, 'praise', praiseArr.toString(), function (err, result) {
				if (err) {
					done({msg: '取消评论赞失败'});
				}
				done(null, result);
			});
		}
	}, function (err, results) {
		if (err) {
			return res.status(403).json(err);
		}
		return res.status(200).json({msg: '取消评论赞成功'});
	});
});

// 为评论点赞
router.post('/addPraise', function (req, res, next) {
	var commentid = req.body.commentid;
	var from = req.session.user._id;
	var praiseArr = [];
	praiseArr.push(from);

	async.series({
		findComment: function (done) {
			redisClient.hget('comment:commentid:' + commentid, 'praise', function (err, result) {
				if (err) {
					done({msg: '查询评论赞失败'});
				}
				if (result) {
					praiseArr = praiseArr.concat(result.split(','));
				}
				done(null, result);
			});
		},
		updateComment: function (done) {
			redisClient.hset('comment:commentid:' + commentid, 'praise', praiseArr.toString(), function (err, result) {
				if (err) {
					done({msg: '添加评论赞失败'});
				}
				done(null, result);
			});
		}
	}, function (err, results) {
		if (err) {
			return res.status(403).json(err);
		}
		return res.status(200).json({msg: '添加评论赞成功'});
	});
});

// 发表普通的评论
router.post('/normal', function (req, res, next) {
	// 得到articleid，查出article的内容，并且将commentid保存进去
	// 保存comment的key
	// to表示的是文章的用户id
	var to = req.body.userid;
	// from表示的是评论人的id
	var from = req.session.user._id;
	var articleid = req.body.articleid;
	var content = req.body.content;
	var commentid = new ObjectId().toString();

	async.series({
		updateArticle: function (done) {
			redisClient.hget('article:articleid:' + articleid, 'commentsid', function (err, result) {
				if (err) {
					done({msg: '查询文章失败'});
				}
				var commentsid = [];
				commentsid.push(commentid);
				if (result) {
					commentsid = commentsid.concat(result.split(','));
				}
				redisClient.hset('article:articleid:' + articleid, 'commentsid', commentsid.toString(), function (err, result) {
					if (err) {
						done({msg: '评论id保存失败'});
					}

					done(null, result);
				});
			});
		},
		saveComment: function (done) {
			redisClient.hmset('comment:commentid:' + commentid, ['articleid', articleid, 'from', from, 'to', to, 'content', content, 'createAt', new Date().toString(), 'praise', '', 'reply', ''], function (err, result) {
				if (err) {
					done({msg: '评论保存失败'});
				}
				done(null, result);
			});
		},
		findComment: function (done) {
			redisClient.hgetall('comment:commentid:' + commentid, function (err, result) {
				if (err) {
					done({msg: '查询评论失败'});
				}
				done(null, result);
			});
		},
	}, function (err, results) {
		if (err) {
			return res.status(403).json(err);
		} 
		results.findComment.msg = '评论成功';
		results.findComment.avatar = req.session.user.avatar;
		results.findComment.commentid = commentid;
		console.log(results.findComment);
		return res.status(200).json(results.findComment);
	});
});

module.exports = router;