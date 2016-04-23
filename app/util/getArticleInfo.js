var redisClient = require('../config').redisClient;
var async = require('async');

function getArticle(articleid, cb) {
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
                    article = result;
                    article.articleid = articleid;
                    userid = result.userid;
                    done(null, result);
                } else {
                    done(null);
                }
            });
        },
        getUserName: function(done) {
            redisClient.get('users:userid:' + userid + ':username', function(err, result) {
                if (err) {
                    done({ msg: '查询用户名失败' });
                } else {
                    if (result) {
                        article.username = result;
                        done(null, result);
                    } else {
                        done(null);
                    }
                }
            });
        },
        getUserAvatar: function(done) {
            redisClient.get('users:userid:' + userid + ':avatar', function(err, result) {
                if (err) {
                    done({ msg: '查询用户头像失败' });
                } else {
                    if (result) {
                        article.avatar = result;
                        done(null, result);
                    } else {
                        done(null);
                    }
                }
            });
        }
    }, function(err, result) {
        cb(err, article);
    });
}

function getComment(commentid, cb) {
    var comment = {};
    var fromUserid = '';
    var toUserid = '';
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
                    fromUserid = result.from;
                    toUserid = result.to;
                    done(null, result);
                } else {
                    done(null);
                }
            });
        },
        getFromName: function(done) {
            redisClient.get('users:userid:' + fromUserid + ':username', function(err, result) {
                if (err) {
                    done({ msg: '查询from用户名失败' });
                } else {
                    if (result) {
                        comment.fromUsername = result;
                        done(null, result);
                    } else {
                        done(null);
                    }
                }
            });
        },
        getToName: function(done) {
            redisClient.get('users:userid:' + toUserid + ':username', function(err, result) {
                if (err) {
                    done({ msg: '查询to用户名失败' });
                } else {
                    if (result) {
                        comment.toUsername = result;
                        done(null, result);
                    } else {
                        done(null);
                    }
                }
            });
        },
        getFromUserAvatar: function(done) {
            redisClient.get('users:userid:' + fromUserid + ':avatar', function(err, result) {
                if (err) {
                    done({ msg: '查询用户头像失败' });
                } else {
                    if (result) {
                        comment.fromAvatar = result;
                        done(null, result);
                    } else {
                        done(null);
                    }
                }
            });
        }
    }, function(err, result) {
        cb(err, comment);
    });
}

function getSComment(scommentid, cb) {
    var scomment = {};
    var fromUserid = '';
    var toUserid = '';
    async.series({
        getSComment: function(done) {
            redisClient.hgetall('replycomment:replycommentid:' + scommentid, function(err, result) {
                if (err) {
                    done({ msg: '查询回复失败' });
                }
                if (result) {
                    /*
                    { 
                    	to: '57161fbac9f38d924576f671',
                    	toUsername: '',
                    	content: '水电费对方',
                    	praise: '',
                    	createAt: 'Thu Apr 21 2016 19:08:59 GMT+0800 (CST)',
                    	from: '57161fbac9f38d924576f671',
                    	fromUsername: '',
                    	fromAvatar: '',
                    }
                    */
                    scomment = result;
                    scomment.scommentid = scommentid;
                    fromUserid = result.from;
                    toUserid = result.to;
                    done(null, result);
                } else {
                    done(null);
                }
            });
        },
        getFromName: function(done) {
            redisClient.get('users:userid:' + fromUserid + ':username', function(err, result) {
                if (err) {
                    done({ msg: '查询from用户名失败' });
                } else {
                    if (result) {
                        scomment.fromUsername = result;
                        done(null, result);
                    } else {
                        done(null);
                    }
                }
            });
        },
        getToName: function(done) {
            redisClient.get('users:userid:' + toUserid + ':username', function(err, result) {
                if (err) {
                    done({ msg: '查询to用户名失败' });
                } else {
                    if (result) {
                        scomment.toUsername = result;
                        done(null, result);
                    } else {
                        done(null);
                    }
                }
            });
        },
        getFromUserAvatar: function(done) {
            redisClient.get('users:userid:' + fromUserid + ':avatar', function(err, result) {
                if (err) {
                    done({ msg: '查询用户头像失败' });
                } else {
                    if (result) {
                        scomment.fromAvatar = result;
                        done(null, result);
                    } else {
                        done(null);
                    }
                }
            });
        }
    }, function(err, result) {
        cb(err, scomment);
    });
}

/*
{ 
	content: '士大夫第三方',
	picURL: '',
	createAt: 'Fri Apr 22 2016 15:15:55 GMT+0800 (CST)',
	userid: '57161e84c9f38d924576f66e',
	praise: '57161e84c9f38d924576f66e',
	commentsid: '5719cfb19f65976c07df3c93',
	articleid: '5719cfab9f65976c07df3c92',
	username: '百里登风',
	avatar: '/images/defaultAvatar.png'
}

*/
/*
getArticle('5719cfab9f65976c07df3c92', function (err, article) {
	console.log(article);
});
*/
/*
{ 
  to: '57161e84c9f38d924576f66e',
  content: '士大夫第三方',
  praise: '57161e84c9f38d924576f66e,57161e84c9f38d924576f66e',
  articleid: '5719cfab9f65976c07df3c92',
  from: '57161e84c9f38d924576f66e',
  createAt: 'Fri Apr 22 2016 15:16:01 GMT+0800 (CST)',
  reply: '5719cfc39f65976c07df3c96,5719cfbe9f65976c07df3c95,5719cfb79f65976c07df3c94',
  commentid: '5719cfb19f65976c07df3c93',
  fromUsername: '百里登风',
  toUsername: '百里登风',
  fromAvatar: '/images/defaultAvatar.png' 
}
*/
/*
getComment('5719cfb19f65976c07df3c93', function (err, comment) {
	console.log(comment);
});*/

/*
{ 
  from: '57161e84c9f38d924576f66e',
  to: '57161e84c9f38d924576f66e',
  content: '第三方',
  createAt: 'Fri Apr 22 2016 15:16:19 GMT+0800 (CST)',
  commentid: '5719cfb19f65976c07df3c93',
  praise: '57161e84c9f38d924576f66e,57161e84c9f38d924576f66e',
  scommentid: '5719cfc39f65976c07df3c96',
  fromUsername: '百里登风',
  toUsername: '百里登风',
  fromAvatar: '/images/defaultAvatar.png' 
}
*/

/*getSComment('5719cfc39f65976c07df3c96', function (err, scomment) {
	console.log(scomment);
});*/
// '5719cfab9f65976c07df3c92'
function getCompleteArticle(articleid, cb) {
    var article = {};
    async.series({
        getArticle: function(done) {
            getArticle(articleid, function(err, _article) {
                if (err) {
                    done(err);
                } else {
                    article = _article;
                    article.comments = [];
                    done(null, article);
                }
            });
        },
        getComment: function(done) {
            var commentsid = article.commentsid;
            if (commentsid) {
	            var commentsidArr = commentsid.split(',');
                //console.log(commentsidArr);
	            async.forEachSeries(commentsidArr, function(item, done) {
	                getComment(item, function(err, comment) {
	                    if (err) {
	                        done(err);
	                    } else {
	                        comment.scomments = [];
	                        var reply = comment.reply;
                            console.log(reply);
                            // console.log(comment);
	                        if (reply) {
	                        	var replyArr = reply.split(',');
                                console.log(replyArr);
		                        async.forEachSeries(replyArr, function(item, done) {
		                            getSComment(item, function(err, scomment) {
		                                if (err) {
                                            console.log(err);
		                                    done(err);
		                                } else {
                                            console.log(scomment);
		                                    comment.scomments.push(scomment);
		                                    done(null);
		                                }
		                            });
		                        }, function(err) {
		                            if (err) {
                                        console.log(err);
		                                done(err);
		                            } else {
                                        console.log(comment);
		                                article.comments.push(comment);
		                                done(null);
		                            }
		                        });
	                        } else {
                                article.comments.push(comment);
	                        	done(null);
	                        }
	                    }
	                });
	            }, function(err) {
	                if (err) {
	                    done(err);
	                } else {
	                    done(null);
	                }
	            });
            } else {
            	done(null);
            }
        }
    }, function(err, results) {
        cb(err, article);
    });
}
// getCompleteArticle('5719f41a8807bc681fdd4473', function(err, article) {
//     console.log(article);
//     console.log(article.comments[0]);
//     console.log(article.comments[0].scomments.length);
//     for (var i = 0; i < article.comments[0].scomments.length; i++) {
//        console.log(article.comments[0].scomments[i]);
//     }
// });

/*getComment('5719f4428807bc681fdd4477', function (err, comment) {
    console.log(comment);
});*/

module.exports = getCompleteArticle;



/*
{
    content: 'ssdfdsfd',
    picURL: '',
    createAt: 'Fri Apr 22 2016 15:15:55 GMT+0800 (CST)',
    userid: '57161e84c9f38d924576f66e',
    praise: '57161e84c9f38d924576f66e',
    commentsid: '5719cfb19f65976c07df3c93',
    articleid: '5719cfab9f65976c07df3c92',
    username: '百里登风',
    avatar: '/images/defaultAvatar.png',
    comments: [{
        to: '57161e84c9f38d924576f66e',
        content: 'ssdfdsfd',
        praise: '57161e84c9f38d924576f66e,57161e84c9f38d924576f66e',
        articleid: '5719cfab9f65976c07df3c92',
        from: '57161e84c9f38d924576f66e',
        createAt: 'Fri Apr 22 2016 15:16:01 GMT+0800 (CST)',
        reply: '5719cfc39f65976c07df3c96,5719cfbe9f65976c07df3c95,5719cfb79f65976c07df3c94',
        commentid: '5719cfb19f65976c07df3c93',
        fromUsername: '百里登风',
        toUsername: '百里登风',
        fromAvatar: '/images/defaultAvatar.png',
        scomments: [
			{
			    from: '57161e84c9f38d924576f66e',
			    to: '57161e84c9f38d924576f66e',
			    content: 'ssdfdsfd',
			    createAt: 'Fri Apr 22 2016 15:16:19 GMT+0800 (CST)',
			    commentid: '5719cfb19f65976c07df3c93',
			    praise: '57161e84c9f38d924576f66e,57161e84c9f38d924576f66e',
			    scommentid: '5719cfc39f65976c07df3c96',
			    fromUsername: '百里登风',
			    toUsername: '百里登风',
			    fromAvatar: '/images/defaultAvatar.png'
			} {
			    from: '57161e84c9f38d924576f66e',
			    to: '57161e84c9f38d924576f66e',
			    content: 'ssdfdsfd',
			    createAt: 'Fri Apr 22 2016 15:16:14 GMT+0800 (CST)',
			    commentid: '5719cfb19f65976c07df3c93',
			    praise: '57161e84c9f38d924576f66e,57161e84c9f38d924576f66e',
			    scommentid: '5719cfbe9f65976c07df3c95',
			    fromUsername: '百里登风',
			    toUsername: '百里登风',
			    fromAvatar: '/images/defaultAvatar.png'
			} {
			    from: '57161e84c9f38d924576f66e',
			    to: '57161e84c9f38d924576f66e',
			    content: 'ssdfdsfd',
			    createAt: 'Fri Apr 22 2016 15:16:07 GMT+0800 (CST)',
			    commentid: '5719cfb19f65976c07df3c93',
			    praise: '57161e84c9f38d924576f66e,57161e84c9f38d924576f66e',
			    scommentid: '5719cfb79f65976c07df3c94',
			    fromUsername: '百里登风',
			    toUsername: '百里登风',
			    fromAvatar: '/images/defaultAvatar.png'
			}
        ]
    }]
}
*/