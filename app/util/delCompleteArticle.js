var redisClient = require('../config').redisClient;
var async = require('async');
var Article = require('../models/article');

// 仅仅将链表中的articleid删除了
function delCompleteArticle(articleid, cb) {
    var flag = true; // 这里的标识表示文章存放在mongodb中还是redis中，true表示在redis中，false表示在mongodb中
    var redisFlag = true; // 这里用于判断当前文章是否还在当前用户的链表中，如果在currentpost:userid中，则为true，如果还在global:article中，则为false
    var userid = '';
    async.series({
        delRedisArticle: function(done) {
            // 返回一个json
            // 如果能查到文章的话，说明文章还在redis中，global或者currentpost:userid中
            redisClient.hgetall('article:articleid:' + articleid, function(err, result) {
                if (err) {
                    done({ msg: '查询文章失败' });
                }

                /*
                	{ 	content: '第三方',
                		picURL: '',
                		createAt: 'Thu Apr 21 2016 19:43:54 GMT+0800 (CST)',
                		userid: '57161fbac9f38d924576f671',
                		praise: '',
                		commentsid: '5718bd1d42e2c86c4c57d231,5718bcfc42e2c86c4c57d22d' 
                		articleid: '',
                		username: '',
                		avatar: ''
                	}
                */
               
                if (result) {
                    // 如果为true的话，之后就要判断是在当前用户这里还是在全局链表中
                    flag = true;
                    userid = result.userid;
                    redisClient.lrange('currentpost:userid:' + result.userid, 0, -1, function (err, result) {
                        if (err) {
                            done({msg: '当前用户文章链表查询失败'});
                        } else {
                            // 如果不等于-1，表示文章还在当前链表中，则进行删除
                            if (result.indexOf(articleid) != -1) {
                                redisClient.lrem('currentpost:userid:' + result.userid, 1, articleid, function (err, result) {
                                    if (err) {
                                        done({msg: '当前用户文章链表删除失败'});
                                    } else {
                                        done(null, result);
                                    }
                                });
                            } else {
                                // 如果等于-1，表示文章在全局链表中，进行删除
                                redisClient.lrem('global:article', 1, articleid, function (err, result) {
                                    if (err) {
                                        done({msg: '全局文章链表删除失败'});
                                    } else {
                                        done(null, result);
                                    }
                                });
                            }
                        }
                    });
                } else {
                    flag = false;
                    done(null);
                }
            });
        },
        // 由于mongodb中文章集合包含了文章和评论，所以在删除的时候会一并删掉的
        delMongodbArticle: function (done) {
            if (!flag) {
                Article.remove({_id: articleid}, function (err, result) {
                    if (err) {
                        done({msg: 'mongodb中删除文章错误'});
                    } else {
                        done(null, result);
                    }
                }); 
            } else {
                done(null);
            }
        },
        delArticle: function (done) {
            if (flag) {
                delArticle(articleid, function (err, article) {
                    var commentsid = article.commentsid;
                    if (commentsid) {
                        var comments = commentsid.split(',');
                        async.forEachSeries(comments, function (item, done) {
                            delComment(item, function (err, comment) {
                                var reply = comment.reply;
                                if (reply) {
                                    var replyArr = reply.split(',');
                                    async.forEachSeries(replyArr, function (item, done) {
                                        delSComment(item, function (err) {
                                            if (err) {
                                                done(err);
                                            } else {
                                                done(null);
                                            }
                                        });
                                    }, function (err) {
                                        if (err) {
                                            done(err);
                                        } else {
                                            done(null);
                                        }
                                    });
                                } else {
                                    done(null);
                                }
                            });
                        }, function (err) {
                            if (err) {
                                done(err);
                            } else {
                                done(null);
                            }
                        });
                    } else {
                        done(null);
                    }
                });
            } else {
                done(null);
            }
        },
        // 之所以再维护一个集合，因为文章数量不仅仅是redis中的，而且还有mongodb中的
        decrCurrentPostNum: function (done) {
            if (userid) {
                redisClient.decr('currentpostnum:userid:' + userid, function (err, result) {
                    if (err) {
                        done({msg: '减少当前用户发布文章数量失败'});
                    }
                    done(null, result);
                });
            } else {
                done(null);
            }
        },
    }, function (err, results) {
        cb(err);
    });
}

// 得到文章：
function delArticle(articleid, cb) {
    var article = {};
    var userid = '';
    async.series({
        getArticle: function(done) {
            // 返回一个json
            redisClient.hgetall('article:articleid:' + articleid, function(err, result) {
                if (err) {
                    done({ msg: '查询文章失败' });
                }

                /*
                    {   content: '第三方',
                        picURL: '',
                        createAt: 'Thu Apr 21 2016 19:43:54 GMT+0800 (CST)',
                        userid: '57161fbac9f38d924576f671',
                        praise: '',
                        commentsid: '5718bd1d42e2c86c4c57d231,5718bcfc42e2c86c4c57d22d' 
                        articleid: '',
                        username: '',
                        avatar: ''
                    }
                */
               
                if (result) {
                    article = result;
                    article.articleid = articleid;
                    done(null, result);
                } else {
                    done(null);
                }
            });
        },
        delArticle: function (done) {
            redisClient.del('article:articleid:' + articleid, function (err, result) {
                if (err) {
                    done({msg: '文章删除失败'});
                } else {
                    done(null, result);
                }
            });
        }
    }, function(err, result) {
        cb(err, article);
    });
}

function delComment(commentid, cb) {
    var comment = {};
    async.series({
        getComment: function(done) {
            redisClient.hgetall('comment:commentid:' + commentid, function(err, result) {
                if (err) {
                    done({ msg: '查询评论失败' });
                }
                if (result) {
                    /*
                    { 
                    	articleid: '5718b49842e2c86c4c57d216',
                    	to: '57161fbac9f38d924576f671',
                    	toUsername: '',
                    	content: '水电费对方',
                    	praise: '',
                    	createAt: 'Thu Apr 21 2016 19:08:59 GMT+0800 (CST)',
                    	from: '57161fbac9f38d924576f671',
                    	fromUsername: '',
                    	reply: '5718b74a42e2c86c4c57d21b'
                    	fromavatar: '',
                    	commentid: ''						
                    }
                    */
                    comment = result;
                    comment.commentid = commentid;
                    done(null, result);
                } else {
                    done(null);
                }
            });
        },
        delComment: function (done) {
            redisClient.del('comment:commentid:' + commentid, function (err, result) {
                if (err) {
                    done({msg: '评论删除失败'});
                } else {
                    done(null, result);
                }
            });
        }
    }, function(err, result) {
        cb(err, comment);
    });
}

function delSComment(scommentid, cb) {
    async.series({
        delSComment: function(done) {
            redisClient.del('replycomment:replycommentid:' + scommentid, function(err, result) {
                if (err) {
                    done({ msg: '查询回复失败' });
                } else {
                    done(null, result);
                }
            });
        }
    }, function(err, result) {
        cb(err);
    });
}

module.exports = delCompleteArticle;