var express = require('express');
var async = require('async');
var getUserCompleteInfo = require('../util/getUserCompleteInfo');
var getArticleInfo = require('../util/getArticleInfo');
var redisClient = require('../config').redisClient;
var mongodbClient = require('./app/config').mongodbClient;

var router = express.Router();

router.get('/acquire/92a2b5cb9c6906035c2864fa225e1940', function (req, res, next) {
    if (!req.session.user) {
        res.redirect('/');
    } else {
        var user = req.session.user;
        var tempid = req.query.userid;
        var limit = req.query.limit;
        var currentPage = req.query.page;
        var skip = (currentPage - 1) * limit;
        var articleListId = [];
        var completeArticle = [];
        if (currentPage < 7) {
            async.series({
                getArticleListId: function (done) {
                    redisClient.lrange('currentpost:userid:' + tempid, skip, skip + 5, function (err, result) {
                        if (err) {
                            done({msg: '查询当前用户文章列表失败'});
                        } else {
                            if (result && result.length > 0) {
                                articleListId = result;
                                done(null);
                            } else {
                                done(null);
                            }
                        }
                    });
                },
                // 得到完整的文章
                getCompleteArticle: function (done) {
                    async.forEachSeries(articleListId, function (item, done) {
                        getArticleInfo(item, function(err, article) {
                            if (err) {
                                done(err);
                            } else {
                                completeArticle.push(article);
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
                }
            }, function (err, results) {
                if (err) {
                    return res.status(403).json({msg:'分页查询失败'});
                } else {
                    completeArticle.sort(function (a, b) {
                        return new Date(b.createAt) - new Date(a.createAt);
                    });

                    for (var i = 0; i < completeArticle.length; i++) {
                        completeArticle[i].comments.sort(function (a, b) {
                            return new Date(a.createAt) - new Date(b.createAt);
                        });
                        for (var j = 0; j < completeArticle[i].comments.length; j++) {
                            completeArticle[i].comments[j].scomments.sort(function (a, b) {
                                return new Date(a.createAt) - new Date(b.createAt);
                            });
                        }
                    }
                    var obj = {};
                    obj.completeArticle = completeArticle;
                    obj.msg = {msg: '请求成功'};
                    return res.status(200).json(obj);
                }
            });
        } else {
            
        }
    }
});

router.post('/find', function (req, res, next) {
    var username = req.body.username;
    redisClient.get('users:username:' + username + ':userid', function (err, result) {
        if (err) {
            return res.status(403).json({msg: '查询用户失败'});
        } else {
            if (result) {
                return res.status(200).json({msg: '查询成功', userid: result});
            } else {
                return res.status(403).json({msg: '对不起没有该用户'});
            }
        }
    });
});

// article: 92a2b5cb9c6906035c2864fa225e1940
// fans: 1ed1645edd706dc379effe13f3edcacf
// stars: a5df375d7c972248177e8b4407c8808c

// decide userid = currentuser
// stars
router.get('/detail/:id/a5df375d7c972248177e8b4407c8808c', function (req, res, next) {
	var tempid = req.params.id;
    var tempUser = {};
	var user = req.session.user;
	var starids = [];
    var starArr = [];
	if (user._id == tempid) {
		async.series({
			stars: function(done) {
                redisClient.scard('stars:userid:' + user._id, function(err, count) {
                    if (err) {
                        done({msg: '查询关注人数错误'});
                    } else {
                        done(null, count);
                    }
                });
            },
            fans: function(done) {
                redisClient.scard('fans:userid:' + user._id, function(err, count) {
                    if (err) {
                        done({msg: '查询粉丝人数错误'});
                    } else {
                        done(null, count);
                    }
                });
            },
            getCurrentPostNum: function (done) {
                redisClient.get('currentpostnum:userid:' + user._id, function (err, result) {
                    if (err) {
                        done({msg: '得到当前用户发布文章数量失败'});
                    } else {
                        done(null, result);
                    }
                });
            },
            // 获取stars的信息：
            getStarsInfo: function (done) {
            	async.series({
            		getStarsId: function (done) {
            			redisClient.smembers('stars:userid:' + user._id, function (err, results) {
            				if (err) {
            					done({msg: '查询关注者集合失败'});
            				} else {
            					starids = results;
            					done(null, results);
            				}
            			});
            		},
            		getStarsUserInfo: function (done) {
            			async.forEachSeries(starids, function (item, done) {
                            getUserCompleteInfo(item, function (err, user) {
                                if (err) {
                                    done(err);
                                } else {
                                    starArr.push(user);
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
            		}
            	}, function (err, results) {
            		if (err) {
            			done(err);
            		} else {
            			done(null, results);
            		}
            	});
            }
		}, function (err, results) {
			if (err) {
				return res.status(403).json(err);
			} else {
                starArr.sort(function (a, b) {
                    return new Date(b.createTime) - new Date(a.createTime);
                });
				res.render('pages/ife_home/ife_stars', {
					userid: user._id,
					username: user.username,
					avatar: user.avatar,
					avatarFlag: user.avatarFlag,
					createTime: user.createTime,
					currentpostnum: results.getCurrentPostNum,
					fans: results.fans,
					stars: results.stars,
					// 大坑啊，jade渲染模板的时候不能写self属性啊
                    starArr: starArr,
                    starids: starids,
					other: false,
                    tempuserid: user._id,
                    tempusername: user.username
				});
			}
		});
	} else {
        var interStarsList = [];
        var interStarsListArr = [];
        async.series({
            // 获取stars的信息：
            getStarsId: function (done) {
                redisClient.smembers('stars:userid:' + tempid, function (err, results) {
                    if (err) {
                        done({msg: '查询关注者集合失败'});
                    } else {
                        starids = results;
                        done(null, results);
                    }
                });
            },
            getStarsInfo: function (done) {
                async.series({
                    getStarsUserInfo: function (done) {
                        async.forEachSeries(starids, function (item, done) {
                            getUserCompleteInfo(item, function (err, user) {
                                if (err) {
                                    done(err);
                                } else {
                                    starArr.push(user);
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
                    },
                    getStarsId: function (done) {
                        redisClient.smembers('stars:userid:' + user._id, function (err, results) {
                            if (err) {
                                done({msg: '查询当前用户的关注者集合失败'});
                            } else {
                                starids = results;
                                done(null, results);
                            }
                        });
                    }
                }, function (err, results) {
                    if (err) {
                        done(err);
                    } else {
                        done(null, results);
                    }
                });
            },
            getTempUser: function (done) {
                getUserCompleteInfo(tempid, function (err, user) {
                    if (err) {
                        done(err);
                    } else {
                        tempUser = user;
                        done(null);
                    }
                });
            },
            getCurrentUserStars: function (done) {
                redisClient.smembers('stars:userid:' + user._id, function (err, results) {
                    if (err) {
                        done({msg: '查询当前的用户关注者集合失败'});
                    } else {
                        if (results && results.length > 0) {
                            done(null, results);
                        } else {
                            results = [];
                            done(null, results);
                        }
                    }
                });
            },
            getInterStarsId: function (done) {
                redisClient.sinter('stars:userid:' + user._id, 'stars:userid:' + tempid, function (err, result) {
                    if (err) {
                        done({msg: '求共同关注用户id失败'});
                    } else {
                        if (result && result.length > 0) {
                            interStarsList = result;
                        } else {
                            interStarsList = [];
                        }
                        done(null, result);
                    }
                });
            },
            getInterStarsInfo: function (done) {
                async.forEachSeries(interStarsList, function (item, done) {
                    getUserCompleteInfo(item, function (err, user) {
                        if (err) {
                            done(err);
                        } else {
                            interStarsListArr.push(user);
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
            }
        }, function (err, results) {
            if (err) {
                return res.status(403).json(err);
            } else {
                starArr.sort(function (a, b) {
                    return new Date(b.createTime) - new Date(a.createTime);
                });
                res.render('pages/ife_home/ife_stars', {
                    userid: user._id,
                    username: user.username,
                    avatar: tempUser.avatar,
                    // 不是因为其他人就不需要上传头像了，而是因为当前用户是不可以对其他用户上传头像
                    avatarFlag: true,
                    createTime: tempUser.createTime,
                    currentpostnum: tempUser.articles,
                    fans: tempUser.fans,
                    stars: tempUser.stars,
                    // 大坑啊，jade渲染模板的时候不能写self属性啊
                    starArr: starArr, // 这里查的其他用户的stars信息，
                    starids: starids, // 这里应该是当前用户的stars信息
                    other: true,
                    tempuserid: tempid,
                    tempusername: tempUser.username,
                    currentUserStars: results.getCurrentUserStars,
                    weiStars: interStarsListArr
                });
            }
        });
	}
});


// fans
router.get('/detail/:id/1ed1645edd706dc379effe13f3edcacf', function (req, res, next) {
	var tempid = req.params.id;
    var tempUser = {};
    var user = req.session.user;
    var fansids = [];
    var fansArr = [];
    var starids = [];
    if (user._id == tempid) {
        async.series({
            stars: function(done) {
                redisClient.scard('stars:userid:' + user._id, function(err, count) {
                    if (err) {
                        done({msg: '查询关注人数错误'});
                    } else {
                        done(null, count);
                    }
                });
            },
            fans: function(done) {
                redisClient.scard('fans:userid:' + user._id, function(err, count) {
                    if (err) {
                        done({msg: '查询粉丝人数错误'});
                    } else {
                        done(null, count);
                    }
                });
            },
            getCurrentPostNum: function (done) {
                redisClient.get('currentpostnum:userid:' + user._id, function (err, result) {
                    if (err) {
                        done({msg: '得到当前用户发布文章数量失败'});
                    } else {
                        done(null, result);
                    }
                });
            },
            getStarsId: function (done) {
                redisClient.smembers('stars:userid:' + user._id, function (err, results) {
                    if (err) {
                        done({msg: '查询关注者集合失败'});
                    } else {
                        starids = results;
                        done(null, results);
                    }
                });
            },
            // 获取stars的信息：
            getFansInfo: function (done) {
                async.series({
                    getFansId: function (done) {
                        redisClient.smembers('fans:userid:' + user._id, function (err, results) {
                            if (err) {
                                done({msg: '查询关注者集合失败'});
                            } else {
                                fansids = results;
                                done(null, results);
                            }
                        });
                    },
                    getFansUserInfo: function (done) {
                        async.forEachSeries(fansids, function (item, done) {
                            getUserCompleteInfo(item, function (err, user) {
                                if (err) {
                                    done(err);
                                } else {
                                    fansArr.push(user);
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
                    }
                }, function (err, results) {
                    if (err) {
                        done(err);
                    } else {
                        done(null, results);
                    }
                });
            }
        }, function (err, results) {
            if (err) {
                return res.status(403).json(err);
            } else {
                fansArr.sort(function (a, b) {
                    return new Date(b.createTime) - new Date(a.createTime);
                });
                res.render('pages/ife_home/ife_fans', {
                    userid: user._id,
                    username: user.username,
                    avatar: user.avatar,
                    avatarFlag: user.avatarFlag,
                    createTime: user.createTime,
                    currentpostnum: results.getCurrentPostNum,
                    fans: results.fans,
                    stars: results.stars,
                    // 大坑啊，jade渲染模板的时候不能写self属性啊
                    fansArr: fansArr,
                    starids: starids,
                    other: false,
                    tempuserid: user._id,
                    tempusername: user.username
                });
            }
        });
    } else {
        var interStarsList = [];
        var interStarsListArr = [];
        async.series({
            getStarsId: function (done) {
                redisClient.smembers('stars:userid:' + user._id, function (err, results) {
                    if (err) {
                        done({msg: '查询当前关注者集合失败'});
                    } else {
                        starids = results;
                        done(null, results);
                    }
                });
            },
            // 获取stars的信息：
            getFansInfo: function (done) {
                async.series({
                    getFansId: function (done) {
                        redisClient.smembers('fans:userid:' + tempid, function (err, results) {
                            if (err) {
                                done({msg: '查询关注者集合失败'});
                            } else {
                                fansids = results;
                                done(null, results);
                            }
                        });
                    },
                    getFansUserInfo: function (done) {
                        async.forEachSeries(fansids, function (item, done) {
                            getUserCompleteInfo(item, function (err, user) {
                                if (err) {
                                    done(err);
                                } else {
                                    fansArr.push(user);
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
                    }
                }, function (err, results) {
                    if (err) {
                        done(err);
                    } else {
                        done(null, results);
                    }
                });
            },
            getTempUser: function (done) {
                getUserCompleteInfo(tempid, function (err, user) {
                    if (err) {
                        done(err);
                    } else {
                        tempUser = user;
                        done(null);
                    }
                });
            },
            getCurrentUserStars: function (done) {
                redisClient.smembers('stars:userid:' + user._id, function (err, results) {
                    if (err) {
                        done({msg: '查询当前的用户关注者集合失败'});
                    } else {
                        if (results && results.length > 0) {
                            done(null, results);
                        } else {
                            results = [];
                            done(null, results);
                        }
                    }
                });
            },
            getInterStarsId: function (done) {
                redisClient.sinter('stars:userid:' + user._id, 'stars:userid:' + tempid, function (err, result) {
                    if (err) {
                        done({msg: '求共同关注用户id失败'});
                    } else {
                        if (result && result.length > 0) {
                            interStarsList = result;
                        } else {
                            interStarsList = [];
                        }
                        done(null, result);
                    }
                });
            },
            getInterStarsInfo: function (done) {
                async.forEachSeries(interStarsList, function (item, done) {
                    getUserCompleteInfo(item, function (err, user) {
                        if (err) {
                            done(err);
                        } else {
                            interStarsListArr.push(user);
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
            }
        }, function (err, results) {
            if (err) {
                return res.status(403).json(err);
            } else {
                fansArr.sort(function (a, b) {
                    return new Date(b.createTime) - new Date(a.createTime);
                });
                res.render('pages/ife_home/ife_fans', {
                    userid: user._id,
                    username: user.username,
                    avatar: tempUser.avatar,
                    avatarFlag: true,
                    createTime: tempUser.createTime,
                    currentpostnum: tempUser.articles,
                    fans: tempUser.fans,
                    stars: tempUser.stars,
                    // 大坑啊，jade渲染模板的时候不能写self属性啊
                    fansArr: fansArr, // 这是其他用户的fans信息
                    starids: starids, // 这是当前用户的stars信息
                    other: true,
                    tempuserid: tempid,
                    tempusername: tempUser.username,
                    currentUserStars: results.getCurrentUserStars,
                    weiStars: interStarsListArr
                });
            }
        }); 
    }
});



// article
// 查询出这个人所有的文章
router.get('/detail/:id/92a2b5cb9c6906035c2864fa225e1940', function (req, res, next) {
	var tempid = req.params.id;
    var tempUser = {};
	var user = req.session.user;
    var articleListId = [];
    var completeArticle = [];
	if (user._id == tempid) {
		async.series({
			stars: function(done) {
                redisClient.scard('stars:userid:' + user._id, function(err, count) {
                    if (err) {
                        done({msg: '查询关注人数错误'});
                    } else {
                        done(null, count);
                    }
                });
            },
            fans: function(done) {
                redisClient.scard('fans:userid:' + user._id, function(err, count) {
                    if (err) {
                        done({msg: '查询粉丝人数错误'});
                    } else {
                        done(null, count);
                    }
                });
            },
            getCurrentPostNum: function (done) {
                redisClient.get('currentpostnum:userid:' + user._id, function (err, result) {
                    if (err) {
                        done({msg: '得到当前用户发布文章数量失败'});
                    } else {
                        done(null, result);
                    }
                });
            },
            getArticleListId: function (done) {
                redisClient.lrange('currentpost:userid:' + user._id, 0, 5, function (err, result) {
                    if (err) {
                        done({msg: '查询当前用户文章列表失败'});
                    } else {
                        if (result && result.length > 0) {
                            articleListId = result;
                            done(null);
                        } else {
                            done(null);
                        }
                    }
                });
            },
            // 得到完整的文章
            getCompleteArticle: function (done) {
                async.forEachSeries(articleListId, function (item, done) {
                    getArticleInfo(item, function(err, article) {
                        if (err) {
                            done(err);
                        } else {
                            completeArticle.push(article);
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
            }
		}, function (err, results) {
			if (err) {
				return res.status(403).json(err);
			} else {
                completeArticle.sort(function (a, b) {
                    return new Date(b.createAt) - new Date(a.createAt);
                });

                for (var i = 0; i < completeArticle.length; i++) {
                    completeArticle[i].comments.sort(function (a, b) {
                        return new Date(a.createAt) - new Date(b.createAt);
                    });
                    for (var j = 0; j < completeArticle[i].comments.length; j++) {
                        completeArticle[i].comments[j].scomments.sort(function (a, b) {
                            return new Date(a.createAt) - new Date(b.createAt);
                        });
                    }
                }
				res.render('pages/ife_home/ife_home', {
					userid: user._id,
					username: user.username,
					avatar: user.avatar,
					avatarFlag: user.avatarFlag,
					createTime: user.createTime,
					currentpostnum: results.getCurrentPostNum,
					fans: results.fans,
					stars: results.stars,
					// 大坑啊，jade渲染模板的时候不能写self属性啊
					other: false,
                    completeArticle: completeArticle,
                    tempuserid: user._id,
                    tempusername: user.username
				});
			}
		});
	} else {
        var interStarsList = [];
        var interStarsListArr = [];
        async.series({
            getArticleListId: function (done) {
                redisClient.lrange('currentpost:userid:' + tempid, 0, 5, function (err, result) {
                    if (err) {
                        done({msg: '查询当前用户文章列表失败'});
                    } else {
                        if (result && result.length > 0) {
                            articleListId = result;
                            done(null);
                        } else {
                            done(null);
                        }
                    }
                });
            },
            // 得到完整的文章
            getCompleteArticle: function (done) {
                async.forEachSeries(articleListId, function (item, done) {
                    getArticleInfo(item, function(err, article) {
                        if (err) {
                            done(err);
                        } else {
                            completeArticle.push(article);
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
            },
            getTempUser: function (done) {
                getUserCompleteInfo(tempid, function (err, user) {
                    if (err) {
                        done(err);
                    } else {
                        tempUser = user;
                        done(null);
                    }
                });
            },
            getCurrentUserStars: function (done) {
                redisClient.smembers('stars:userid:' + user._id, function (err, results) {
                    if (err) {
                        done({msg: '查询当前的用户关注者集合失败'});
                    } else {
                        if (results && results.length > 0) {
                            done(null, results);
                        } else {
                            results = [];
                            done(null, results);
                        }
                    }
                });
            },
            getInterStarsId: function (done) {
                redisClient.sinter('stars:userid:' + user._id, 'stars:userid:' + tempid, function (err, result) {
                    if (err) {
                        done({msg: '求共同关注用户id失败'});
                    } else {
                        if (result && result.length > 0) {
                            interStarsList = result;
                        } else {
                            interStarsList = [];
                        }
                        done(null, result);
                    }
                });
            },
            getInterStarsInfo: function (done) {
                async.forEachSeries(interStarsList, function (item, done) {
                    getUserCompleteInfo(item, function (err, user) {
                        if (err) {
                            done(err);
                        } else {
                            interStarsListArr.push(user);
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
            }
        }, function (err, results) {
            if (err) {
                return res.status(403).json(err);
            } else {
                completeArticle.sort(function (a, b) {
                    return new Date(b.createAt) - new Date(a.createAt);
                });

                for (var i = 0; i < completeArticle.length; i++) {
                    completeArticle[i].comments.sort(function (a, b) {
                        return new Date(a.createAt) - new Date(b.createAt);
                    });
                    for (var j = 0; j < completeArticle[i].comments.length; j++) {
                        completeArticle[i].comments[j].scomments.sort(function (a, b) {
                            return new Date(a.createAt) - new Date(b.createAt);
                        });
                    }
                }
                res.render('pages/ife_home/ife_home', {
                    userid: user._id,
                    username: user.username,
                    avatar: tempUser.avatar,
                    avatarFlag: true,
                    createTime: tempUser.createTime,
                    currentpostnum: tempUser.articles,
                    fans: tempUser.fans,
                    stars: tempUser.stars,
                    // 大坑啊，jade渲染模板的时候不能写self属性啊
                    other: true,
                    completeArticle: completeArticle,
                    tempuserid: tempid,
                    tempusername: tempUser.username,
                    currentUserStars: results.getCurrentUserStars,
                    weiStars: interStarsListArr
                });
            }
        });
	}
});
module.exports = router;