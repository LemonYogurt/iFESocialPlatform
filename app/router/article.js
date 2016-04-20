var express = require('express');
var formidable = require('formidable');
var uuid = require('uuid');
var fs = require('fs');
var path = require('path');
var async = require('async');
var ObjectId = require('bson').ObjectId;
var redisClient = require('../config').redisClient;
var router = express.Router();


// 取消文章点赞
router.post('/cancelPraise', function(req, res, next) {
    var praiseArr = [];
    async.series({
        getOriginPraise: function (done) {
        	redisClient.hget('article:articleid:' + req.body.articleid, 'praise', function (err, result) {
        		if (err) {
        			done({msg: '查询赞失败'});
        		}
        		var praise = result;
        		praiseArr = praiseArr.concat(praise.split(','));
        		if (praiseArr.indexOf(req.body.from) != -1) {
        			praiseArr.splice(praiseArr.indexOf(req.body.from), 1);
        		}
        		done(null, result);
        	});
        },
        updatePraise: function (done) {
        	redisClient.hset('article:articleid:' + req.body.articleid, 'praise', praiseArr.toString(), function(err, result) {
                if (err) {
                    done({ msg: '取消赞失败' });
                }
                done(null, result);
            });
        }
    }, function(err, results) {
        if (err) {
            return res.status(403).json(err);
        }
        return res.status(200).json({ msg: '取消赞成功' });
    });
});

// 给文章点赞
router.post('/addPraise', function(req, res, next) {
    // 得到了body中的内容后，articleid和from,
    var praiseArr = [];
    praiseArr.push(req.body.from);
    async.series({
        updatePraise: function(done) {
            redisClient.hset('article:articleid:' + req.body.articleid, 'praise', praiseArr.toString(), function(err, result) {
                if (err) {
                    done({ msg: '点赞失败' });
                }
                done(null, result);
            });
        }
    }, function(err, results) {
        if (err) {
            return res.status(403).json(err);
        }
        console.log(results);
        return res.status(200).json({ msg: '点赞成功' })
    });
});

// 发表文章
router.post('/post', function(req, res, next) {
    new formidable.IncomingForm().parse(req, function(err, fields, files) {
        var picURL = '';
        if (files.pic) {
            var pic = files.pic;
            var picName = uuid.v4() + path.extname(pic.name);
            picURL = '/upload/' + picName;
            fs.createReadStream(pic.path).pipe(fs.createWriteStream('./public/upload/' + picName));
        }

        var articleid = new ObjectId().toString();
        var content = fields.content;
        var createAt = new Date().toString();
        var userid = req.session.user._id;
        var praise = [].toString();

        async.series({
            insertArticle: function(done) {
                redisClient.hmset('article:articleid:' + articleid, ['content', content, 'picURL', picURL, 'createAt', createAt, 'userid', userid, 'praise', praise], function(err, result) {
                    if (err) {
                        done({ msg: 'redis写入article失败' });
                    }
                    done(null, result);
                });
            },
            findArticle: function(done) {
                // 查询出来的内容就是一个对象，对象的内容都是字符串
                redisClient.hgetall('article:articleid:' + articleid, function(err, result) {
                    if (err) {
                        done({ msg: 'redis中查询文章失败' });
                    }
                    done(null, result);
                });
            }
        }, function(err, results) {
            if (err) {
                return res.status(403).json(err);
            }
            results.findArticle.username = req.session.user.username;
            results.findArticle.avatar = req.session.user.avatar;
            results.findArticle.articleid = articleid;
            results.findArticle.msg = '上传成功';
            console.log(results.findArticle);
            return res.status(200).json(results.findArticle);
        });
    });
});

module.exports = router;
