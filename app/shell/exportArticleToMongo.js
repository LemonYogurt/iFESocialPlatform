'use strict';
var async = require('async');
var mongodbClient = require('../config').mongodbClient;
var redisClient = require('../config').redisClient;
var Article = require('../models/article');
var getCompleteArticle = require('../util/getArticleInfo');
var delCompleteArticle = require('../util/delCompleteArticle');

// 全局文章链表的名称：global:article
function shell() {
	var globalArticleList = [];
	async.series({
		findGlobalArticleId: function (done) {
			redisClient.lrange('global:article', 0, -1, function (err, result) {
				if (err) {
					throw err;
					done(err);
				} else {
					if (result && result.length > 0) {
						globalArticleList = result;
					}
					done(null, result);
				}
			});
		},
		exportData: function (done) {
			async.forEachSeries(globalArticleList, function (item, done) {
				getCompleteArticle(item, function (err, article) {
					article = articleSimpleDeal(article);
					var articleObj = new Article(article);
					articleObj.save(function (err, article) {
						if (err) {
							done(err);
						} else {
							redisClient.lrem('global:article', 1, item, function (err, result) {
								if (err) {
									done(err);
								} else {
									delCompleteArticle(item, function (err) {
										if (err) {
											done(err);
										} else {
											done(null);
										}
									});
								}
							});
						}
					});
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
			throw err;
		}
	});
}

function articleSimpleDeal(article) {
	article._id = article.articleid;
	article.createTime = new Date(article.createTime);
	if (article.praise) {
		article.praise = article.praise.split(',');
	} else {
		article.praise = [];
	}
	delete article.articleid;
	delete article.commentsid;

	for (let i = 0; i < article.comments.length; i++) {
		delete article.comments[i].articleid;
		delete article.comments[i].reply;
		article.comments[i]._id = article.comments[i].commentid;
		article.comments[i].createTime = new Date(article.comments[i].createTime);
		if (article.comments[i].praise) {
			article.comments[i].praise = article.comments[i].praise.split(',');
		} else {
			article.comments[i].praise = [];
		}
		for (let j = 0; j < article.comments[i].scomments.length; j++) {
			delete article.comments[i].scomments[j].commentid;
			article.comments[i].scomments[j]._id = article.comments[i].scomments[j].scommentid;
			article.comments[i].scomments[j].createTime = new Date(article.comments[i].scomments[j].createTime);
			if (article.comments[i].scomments[j].praise) {
				article.comments[i].scomments[j].praise = article.comments[i].scomments[j].praise.split(',');	
			} else {
				article.comments[i].scomments[j].praise = [];
			}
		}
	}
	return article;
}

module.exports = shell;