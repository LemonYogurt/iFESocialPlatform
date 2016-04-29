'use strict';
var mongodbClient = require('../config').mongodbClient;
var Article = require('../models/article');
var getCompleteArticle = require('../util/getArticleInfo');

// article:articleid:57219e9f370ffac33a9a0ab0
getCompleteArticle('5721ca45f448a67159448704', function (err, article) {
	article = articleSimpleDeal(article);
	var articleObj = new Article(article);
	articleObj.save(function (err, article) {
		if (err) {
			throw err;
		} else {
			console.log(article);
		}
	});
});

function articleSimpleDeal(article) {
	article._id = article.articleid;
	article.praise = article.praise.split(',');
	delete article.articleid;
	delete article.commentsid;

	for (let i = 0; i < article.comments.length; i++) {
		delete article.comments[i].articleid;
		delete article.comments[i].reply;
		article.comments[i]._id = article.comments[i].commentid;
		article.comments[i].praise = article.comments[i].praise.split(',');
		for (let j = 0; j < article.comments[i].scomments.length; j++) {
			delete article.comments[i].scomments[j].commentid;
			article.comments[i].scomments[j]._id = article.comments[i].scomments[j].scommentid;
			article.comments[i].scomments[j].praise = article.comments[i].scomments[j].praise.split(',');
		}
	}
	return article;
}