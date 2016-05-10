function HomeUserInfo() {
	this.currentPage = 0;
	this.allArticleNum = 0;
	this.pageNum = 0;
	this.limit = 6;
	this.loading = true; // true表示可以进行加载了
}
HomeUserInfo.prototype.initPagination = function () {
	this.allArticleNum = parseInt($('#J_home_articles').html());
	this.currentPage = 1;
	this.pageNum = Math.ceil(this.allArticleNum / this.limit);
}

HomeUserInfo.prototype.generateArticle = function (article, userid) {
	var self = this;
	var size = article.picURL == ''? '20px;' : '10px';
	var close = '';
	var picURL = '';
	var praise = '';
	if (article.userid == userid) {
		close = '<a href="javascript:void(0);" class="ife_article_close" data-articleid="'+article.articleid+'" data-userid="'+article.userid+'">&times;</a>';
	}
	if (article.avatar == '/images/defaultAvatar.png') {
		article.avatar = '/images/ife_userDefaultAvatar_little.gif';
	}
	if (article.picURL != '') {
		picURL = '<div class="ife_article_picCon">\
			<a href="'+article.picURL+'" data-lightbox="roadtrip">\
				<img src="'+article.picURL+'" alt="文章图片" class="ife_article_pic">\
			</a>\
		</div>';
	}
	if (article.praise == '') {
		praise = '<div class="ife_article_info clearfix">\
					<span class="ife_article_time">发表于&nbsp;'+moment(new Date(article.createAt)).calendar()+'</span>\
					<a href="javascript:void(0);" data-articleid="'+article.articleid+'" data-userid="'+userid+'" class="ife_article_praise">赞</a>\
				</div>\
				<div class="ife_article_praises_total" total="0" my="0" style="display:none;"></div>';
	} else {
		var a_praiseArr = article.praise.split(',');
		var a_praiseLength = a_praiseArr.length;
		var hasSelf = a_praiseArr.indexOf(userid) == -1 ? false : true;

		if (hasSelf && a_praiseLength > 1) {
			praise = '<div class="ife_article_info clearfix">\
						<span class="ife_article_time">发表于&nbsp;'+moment(new Date(article.createAt)).calendar()+'</span>\
						<a href="javascript:void(0);" class="ife_article_praise" data-articleid="'+article.articleid+'" data-userid="'+userid+'">取消赞</a>\
					</div>\
					<div class="ife_article_praises_total" my="1" total="'+a_praiseLength+'" style="display:block;">我和'+(a_praiseLength - 1)+'个人觉得很赞</div>';
		} else if (hasSelf && a_praiseLength == 1) {
			praise = '<div class="ife_article_info clearfix">\
						<span class="ife_article_time">发表于&nbsp;'+moment(new Date(article.createAt)).calendar()+'</span>\
						<a href="javascript:void(0);" class="ife_article_praise" data-articleid="'+article.articleid+'" data-userid="'+userid+'">取消赞</a>\
					</div>\
					<div class="ife_article_praises_total" my="1" total="'+a_praiseLength+'" style="display:block;">我觉得很赞</div>';
		} else if (!hasSelf) {
			praise = '<div class="ife_article_info clearfix">\
						<span class="ife_article_time">发表于&nbsp;'+moment(new Date(article.createAt)).calendar()+'</span>\
						<a href="javascript:void(0);" class="ife_article_praise" data-articleid="'+article.articleid+'" data-userid="'+userid+'">赞</a>\
					</div>\
					<div class="ife_article_praises_total" my="0" total="'+a_praiseLength+'" style="display:block;">'+a_praiseLength+'个人觉得很赞</div>';
		}
	}
	var comments = '';
	for (var i = 0; i < article.comments.length; i++) {
		comments += self.generateComment(article, article.comments[i], userid);
	}
	var str = '\
			<div class="ife_article">\
				<div class="ife_article_box clearfix">'+close+'\
					<a href="/home/detail/'+article.userid+'/92a2b5cb9c6906035c2864fa225e1940">\
						<img src="'+article.avatar+'" alt="'+article.username+'" class="ife_article_avatar" width="50" height="50">\
					</a>\
					<div class="ife_article_content">\
						<div class="ife_article_main" style="margin-bottom:'+size+'">\
							<h2 class="ife_article_username" data-userid="'+article.userid+'">'+article.username+'</h2>\
							<h3 class="ife_article_publishTime">\
								<a href="javascript:void(0);">\
									<span>'+moment(new Date(article.createAt)).fromNow()+'</span>发布\
								</a>\
							</h3>\
							<p class="ife_article_txt">'+article.content+'</p>'+picURL+'\
						</div>'+praise+'\
						'+comments+'\
						'+self.generateCommentInput(article)+'\
					</div>\
				</div>\
			</div>\
	';
	return str;
};

HomeUserInfo.prototype.generateComment = function (article, comment, userid) {
	var self = this;
	if (comment.fromAvatar == '/images/defaultAvatar.png') {
		comment.fromAvatar = '/images/ife_userDefaultAvatar_little.gif';
	}
	var praise = '';
	var c_praiseArr = comment.praise.split(',');
	var c_praiseLength = c_praiseArr.length;

	var hascSelf = c_praiseArr.indexOf(userid) == -1 ? false : true;
	if (comment.praise == '') {
		praise = '<a href="javascript:void(0);" total="0" my="0" class="ife_article_comment_praise" data-commentid="'+comment.commentid+'">&nbsp;赞</a>';
	}else if (hascSelf) {
		praise = '<a href="javascript:void(0);" class="ife_article_comment_praise" total="'+c_praiseLength+'" my="1" style="display:inline-block;" data-commentid="'+comment.commentid+'">'+c_praiseLength+'&nbsp;取消赞</a>';
	} else if (!hascSelf) {
		praise = '<a href="javascript:void(0);" class="ife_article_comment_praise" total="'+c_praiseLength+'" my="0" data-commentid="'+comment.commentid+'">'+c_praiseLength+'&nbsp;赞</a>';
	}
	var scomments = '';
	for (var i = 0; i < comment.scomments.length; i++) {
		scomments += self.generateSComment(comment, comment.scomments[i], userid);
	}
	var str = '\
				<div class="ife_article_comment_list" data-commentid="'+comment.commentid+'">\
					<div class="ife_article_comment_box clearfix">\
						<a href="/home/detail/'+comment.from+'/92a2b5cb9c6906035c2864fa225e1940">\
							<img src="'+comment.fromAvatar+'" alt="'+comment.fromUsername+'" class="ife_article_commentAvatar" width="40" height="40" />\
						</a>\
						<div class="ife_article_comment_content">\
							<div class="ife_article_comment_text clearfix">\
								<strong class="ife_article_comment_username">'+(comment.from == userid ? '我': comment.fromUsername)+'</strong>\
								<p class="ife_article_comment_txt">'+comment.content+'</p>\
							</div>\
							<p class="ife_article_comment_time">\
								<em class="ife_article_comment_relatime">'+moment(new Date(comment.createAt)).fromNow()+'</em>'+praise+'\
								<a href="javascript:void(0);" class="ife_article_comment_operate" data-userid="'+comment.from+'" data-commentid="'+comment.commentid+'" data-articleid="'+article.articleid+'" data-username="'+comment.fromUsername+'">'+(comment.from == userid ? '删除' : '回复')+'</a>\
							</p>'+scomments+'\
						</div>\
					</div>\
				</div>\
	';
	return str;
};

HomeUserInfo.prototype.generateSComment = function (comment, scomment, userid) {
	if (scomment.fromAvatar == '/images/defaultAvatar.png') {
		scomment.fromAvatar = '/images/ife_userDefaultAvatar_little.gif';
	}

	var praise = '';
	var s_praiseArr = scomment.praise.split(',');
	var s_praiseLength = s_praiseArr.length;
	var hassSelf = s_praiseArr.indexOf(userid) == -1 ? false : true;
	if (scomment.praise == '') {
		praise = '<a href="javascript:void(0);" class="ife_article_scomment_praise" total="0" my="0" data-userid="'+userid+'" data-scommentid="'+scomment.scommentid+'">&nbsp;赞</a>';
	} else if (hassSelf) {
		praise = '<a href="javascript:void(0);" class="ife_article_scomment_praise" total="'+s_praiseLength+'" my="1" style="display:inline-block;" data-userid="'+userid+'" data-scommentid="'+scomment.scommentid+'">'+s_praiseLength+'&nbsp;取消赞</a>';
	} else if (!hassSelf) {
		praise = '<a href="javascript:void(0);" class="ife_article_scomment_praise" total="'+s_praiseLength+'" my="0" data-userid="'+userid+'" data-scommentid="'+scomment.scommentid+'">'+s_praiseLength+'&nbsp;赞</a>';
	}

	var str = '\
			<div class="ife_article_scomment_box clearfix" data-scommentid="'+scomment.scommentid+'" data-userid="'+scomment.from+'">\
				<a href="/home/detail/'+scomment.from+'/92a2b5cb9c6906035c2864fa225e1940">\
					<img src="'+scomment.fromAvatar+'" alt="'+scomment.fromUsername+'" class="ife_article_scommentAvatar" width="40" height="40" />\
				</a>\
				<div class="ife_article_scomment_content">\
					<div class="ife_article_scomment_text clearfix">\
						<strong class="ife_article_scomment_username">'+(scomment.from == userid ? '我': scomment.fromUsername)+'：&nbsp;回复&nbsp;'+(scomment.to == userid ? '我': scomment.toUsername)+'：</strong>\
						<p class="ife_article_scomment_txt">'+scomment.content+'</p>\
					</div>\
					<p class="ife_article_scomment_time">\
						<em class="ife_article_scomment_relatime">'+moment(new Date(scomment.createAt)).fromNow()+'</em>'+praise+'\
					</p>\
					<a href="javascript:void(0);" class="ife_article_scomment_operate" data-userid="'+scomment.from+'" data-username="'+scomment.fromUsername+'" data-scommentid="'+scomment.scommentid+'" data-commentid="'+comment.commentid+'">'+(scomment.from == userid ? '删除' : '回复')+'</a>\
				</div>\
			</div>\
	';
	return str;
};

HomeUserInfo.prototype.generateCommentInput = function (article) {
	var str = '<div class="ife_article_text_box">\
		<div class="ife_comment_content_publish">\
			<div class="ife_comment_content_hiddenInput">\
				<div class="ife_comment_content_ta" title="评论输入框" contenteditable="true"><span>我也说一句</span></div>\
			</div>\
			<div class="ife_comment_content_inputbox" style="display:none;">\
				<div class="ife_comment_content_input">\
					<div class="ife_comment_content_ta" title="评论输入框" contenteditable="true"></div>\
				</div>\
				<div class="ife_comment_content_publish_footer clearfix">\
					<a href="javascript:void(0);" class="J_comment_face_icon">\
						<img src="/images/edit_avatar.png" alt="表情" />&nbsp;&nbsp;表情\
					</a>\
					<div class="ife_comment_face_con">\
						<ul class="J_comment_faceIcon clearfix">\
							<li><img src="/images/face/zz2_thumb.gif" title="[织]" width="22" height="22"></li><li><img src="/images/face/horse2_thumb.gif" title="[神马]" width="22" height="22"></li><li><img src="/images/face/fuyun_thumb.gif" title="[浮云]" width="22" height="22"></li><li><img src="/images/face/geili_thumb.gif" title="[给力]" width="22" height="22"></li><li><img src="/images/face/wg_thumb.gif" title="[围观]" width="22" height="22"></li><li><img src="/images/face/vw_thumb.gif" title="[威武]" width="22" height="22"></li><li><img src="/images/face/panda_thumb.gif" title="[熊猫]" width="22" height="22"></li><li><img src="/images/face/rabbit_thumb.gif" title="[兔子]" width="22" height="22"></li><li><img src="/images/face/otm_thumb.gif" title="[奥特曼]" width="22" height="22"></li><li><img src="/images/face/j_thumb.gif" title="[囧]" width="22" height="22"></li><li><img src="/images/face/hufen_thumb.gif" title="[互粉]" width="22" height="22"></li><li><img src="/images/face/liwu_thumb.gif" title="[礼物]" width="22" height="22"></li><li><img src="/images/face/smilea_thumb.gif" title="[呵呵]" width="22" height="22"></li><li><img src="/images/face/tootha_thumb.gif" title="[嘻嘻]" width="22" height="22"></li><li><img src="/images/face/laugh.gif" title="[哈哈]" width="22" height="22"></li><li><img src="/images/face/tza_thumb.gif" title="[可爱]" width="22" height="22"></li><li><img src="/images/face/kl_thumb.gif" title="[可怜]" width="22" height="22"></li><li><img src="/images/face/kbsa_thumb.gif" title="[挖鼻屎]" width="22" height="22"></li><li><img src="/images/face/cj_thumb.gif" title="[吃惊]" width="22" height="22"></li><li><img src="/images/face/shamea_thumb.gif" title="[害羞]" width="22" height="22"></li><li><img src="/images/face/zy_thumb.gif" title="[挤眼]" width="22" height="22"></li><li><img src="/images/face/bz_thumb.gif" title="[闭嘴]" width="22" height="22"></li><li><img src="/images/face/bs2_thumb.gif" title="[鄙视]" width="22" height="22"></li><li><img src="/images/face/lovea_thumb.gif" title="[爱你]" width="22" height="22"></li><li><img src="/images/face/sada_thumb.gif" title="[泪]" width="22" height="22"></li><li><img src="/images/face/heia_thumb.gif" title="[偷笑]" width="22" height="22"></li><li><img src="/images/face/qq_thumb.gif" title="[亲亲]" width="22" height="22"></li><li><img src="/images/face/sb_thumb.gif" title="[生病]" width="22" height="22"></li><li><img src="/images/face/mb_thumb.gif" title="[太开心]" width="22" height="22"></li><li><img src="/images/face/ldln_thumb.gif" title="[懒得理你]" width="22" height="22"></li><li><img src="/images/face/yhh_thumb.gif" title="[右哼哼]" width="22" height="22"></li><li><img src="/images/face/zhh_thumb.gif" title="[左哼哼]" width="22" height="22"></li><li><img src="/images/face/x_thumb.gif" title="[嘘]" width="22" height="22"></li><li><img src="/images/face/cry.gif" title="[衰]" width="22" height="22"></li><li><img src="/images/face/wq_thumb.gif" title="[委屈]" width="22" height="22"></li><li><img src="/images/face/t_thumb.gif" title="[吐]" width="22" height="22"></li><li><img src="/images/face/k_thumb.gif" title="[打哈气]" width="22" height="22"></li><li><img src="/images/face/bba_thumb.gif" title="[抱抱]" width="22" height="22"></li><li><img src="/images/face/angrya_thumb.gif" title="[怒]" width="22" height="22"></li><li><img src="/images/face/yw_thumb.gif" title="[疑问]" width="22" height="22"></li><li><img src="/images/face/cza_thumb.gif" title="[馋嘴]" width="22" height="22"></li><li><img src="/images/face/88_thumb.gif" title="[拜拜]" width="22" height="22"></li><li><img src="/images/face/sk_thumb.gif" title="[思考]" width="22" height="22"></li><li><img src="/images/face/sweata_thumb.gif" title="[汗]" width="22" height="22"></li><li><img src="/images/face/sleepya_thumb.gif" title="[困]" width="22" height="22"></li><li><img src="/images/face/sleepa_thumb.gif" title="[睡觉]" width="22" height="22"></li><li><img src="/images/face/money_thumb.gif" title="[钱]" width="22" height="22"></li><li><img src="/images/face/sw_thumb.gif" title="[失望]" width="22" height="22"></li><li><img src="/images/face/cool_thumb.gif" title="[酷]" width="22" height="22"></li><li><img src="/images/face/hsa_thumb.gif" title="[花心]" width="22" height="22"></li><li><img src="/images/face/hatea_thumb.gif" title="[哼]" width="22" height="22"></li><li><img src="/images/face/gza_thumb.gif" title="[鼓掌]" width="22" height="22"></li><li><img src="/images/face/dizzya_thumb.gif" title="[晕]" width="22" height="22"></li><li><img src="/images/face/bs_thumb.gif" title="[悲伤]" width="22" height="22"></li><li><img src="/images/face/crazya_thumb.gif" title="[抓狂]" width="22" height="22"></li><li><img src="/images/face/h_thumb.gif" title="[黑线]" width="22" height="22"></li><li><img src="/images/face/yx_thumb.gif" title="[阴险]" width="22" height="22"></li><li><img src="/images/face/nm_thumb.gif" title="[怒骂]" width="22" height="22"></li><li><img src="/images/face/hearta_thumb.gif" title="[心]" width="22" height="22"></li><li><img src="/images/face/unheart.gif" title="[伤心]" width="22" height="22"></li><li><img src="/images/face/pig.gif" title="[猪头]" width="22" height="22"></li><li><img src="/images/face/ok_thumb.gif" title="[ok]" width="22" height="22"></li><li><img src="/images/face/ye_thumb.gif" title="[耶]" width="22" height="22"></li><li><img src="/images/face/good_thumb.gif" title="[good]" width="22" height="22"></li><li><img src="/images/face/no_thumb.gif" title="[不要]" width="22" height="22"></li><li><img src="/images/face/z2_thumb.gif" title="[赞]" width="22" height="22"></li><li><img src="/images/face/come_thumb.gif" title="[来]" width="22" height="22"></li><li><img src="/images/face/sad_thumb.gif" title="[弱]" width="22" height="22"></li><li><img src="/images/face/lazu_thumb.gif" title="[蜡烛]" width="22" height="22"></li><li><img src="/images/face/clock_thumb.gif" title="[钟]" width="22" height="22"></li><li><img src="/images/face/cake.gif" title="[蛋糕]" width="22" height="22"></li><li><img src="/images/face/m_thumb.gif" title="[话筒]" width="22" height="22"></li><li><img src="/images/face/weijin_thumb.gif" title="[围脖]" width="22" height="22"></li><li><img src="/images/face/lxhzhuanfa_thumb.gif" title="[转发]" width="22" height="22"></li><li><img src="/images/face/lxhluguo_thumb.gif" title="[路过这儿]" width="22" height="22"></li><li><img src="/images/face/bofubianlian_thumb.gif" title="[bofu变脸]" width="22" height="22"></li><li><img src="/images/face/gbzkun_thumb.gif" title="[gbz困]" width="22" height="22"></li><li><img src="/images/face/boboshengmenqi_thumb.gif" title="[生闷气]" width="22" height="22"></li><li><img src="/images/face/chn_buyaoya_thumb.gif" title="[不要啊]" width="22" height="22"></li><li><img src="/images/face/daxiongleibenxiong_thumb.gif" title="[dx泪奔]" width="22" height="22"></li><li><img src="/images/face/cat_yunqizhong_thumb.gif" title="[运气中]" width="22" height="22"></li><li><img src="/images/face/youqian_thumb.gif" title="[有钱]" width="22" height="22"></li><li><img src="/images/face/cf_thumb.gif" title="[冲锋]" width="22" height="22"></li><li><img src="/images/face/camera_thumb.gif" title="[照相机]" width="22" height="22"></li>\
						</ul>\
					</div>\
					<a href="javascript:void(0);" class="ife_comment_publishBtn" data-articleid="'+article.articleid+'" data-userid="'+article.userid+'">发表</a>\
				</div>\
			</div>\
		</div>\
	</div>';
	return str;
}

HomeUserInfo.prototype.generateCompleteArticle = function (article, userid) {
	var self = this;
	var str = self.generateArticle(article, userid);
	$('.ife_article_loading').before(str);
};

HomeUserInfo.prototype.bindScroll = function () {
	var self = this;
	$(window).scroll(function () {
		// 是否是只有在超过1页的情况下才会进行页面的添加
		var urlArr = window.location.href.split('/');
		var urlSuffix = urlArr[urlArr.length - 1];

		if (self.pageNum > 1 && urlSuffix == '92a2b5cb9c6906035c2864fa225e1940') {
			var docHeight = $(document).height(); // 获取当前窗体的高度
			var winHeight = $(window).height(); // 获取可视区的高度
			var winScrollHeight = $(window).scrollTop(); // 获取滚动条滚动的距离
			var disBottom = $('.ife_article_loading').height() + 10;
			if (docHeight - disBottom <= winHeight + winScrollHeight) {
				if (self.loading) {
					self.loading = false;
					self.currentPage += 1;
					if (self.currentPage > self.pageNum) {
						// no more data
						$(window).unbind('scroll');
						$('.ife_article_loading').find('p.ife_article_loading_btn').html('没有更多数据了...');
					} else {
						var tempid = $('#J_homeMediumNavArticle').data('userid');
						// 加载
						setTimeout(function () {
							$.ajax({
								url: '/home/acquire/92a2b5cb9c6906035c2864fa225e1940',
								type: 'GET',
								data: {limit: self.limit, page: self.currentPage, userid: tempid},
								success: function (data) {
									window.printMsg('success', data.msg, true);
									self.loading = true;
									var userid = $('#J_ifeNavUserName').data('userid');
									for (var i = 0; i < data.completeArticle.length; i++) {
										var article = data.completeArticle[i];
										self.generateCompleteArticle(article, userid);
									}
								},
								error: function (obj) {
									window.printMsg('error', JSON.parse(obj.responseText).msg, true);
									console.log(obj);
								}
							});
						}, 1000);
					}
				}
			}
		}
	});
};

HomeUserInfo.prototype.bindClick = function () {
	$('#J_userAvatar').click(function (e) {
		if ($('#J_uploadAvatar').length) {
			$('#J_uploadAvatar').click();
		}
	});
};
HomeUserInfo.prototype.bindChange = function () {
	$('#J_uploadAvatar').change(function (e) {
		var avatar = e.target.files[0];
		var imgRep = /^image\/(jpeg|jpg|gif|png|bmp$)/i;
		if (imgRep.test(avatar.type)) {
			var fr = new FileReader();
			fr.readAsDataURL(avatar);
			// 首先进行本地预览，本地预览成功后，上传到服务器
			fr.onload = function () {
				$('#J_userAvatar').attr('src', this.result);
				window.printMsg('success', 'avatarLocalSuccess', true);
				setTimeout(function () {
					var fd = new FormData();
					fd.append('avatar', avatar);
					$.ajax({
						url: '/user/avatarUpload',
						type: 'POST',
						data: fd,
						processData: false,
						contentType: false,
						beforeSend: function (xhr) {
							window.message['success'](window.message.infoCode['avatarUpload']);
						},
						success: function (data) {
							window.message['success'](window.message.infoCode['avatarUploadSuccess']);
							if ($('#J_uploadAvatar').length) {
								$('#J_uploadAvatar').remove();
							}
						},
						error: function () {
							window.printMsg('error', JSON.parse(obj.responseText).msg, true);
							$('#J_userAvatar').attr('src', '/images/defaultAvatar.png');
						}
					});
				}, 1000);
			};
		} else {
			window.message['error'](window.message.infoCode['avatarError']);
		}
	});
};
HomeUserInfo.prototype.cancelStars = function () {
	$('.ife_lastestuser').on('click', '.ife_lsuserbtncancelstars', function () {
		var $self = $(this);
		var userid = $(this).data('userid');
		var _$parent = $(this).parent().parent();
		$.confirm({
            autoClose: 'cancel|6000',
            title: '取消关注',
            confirmButton: '取消',
    		content: '您确定要取消对该用户的关注吗？',
            confirm: function(){
                $.ajax({
                    url: '/user/cancelStars',
                    type: 'DELETE',
                    data: {userid: userid},
                    success: function (data) {
                        window.printMsg('success', data.msg, true);
                        // 表示是当前用户自己
                        if ($('.ife_weibouserfocusbtn').length == 0) {
		                	$('#J_home_stars').html(parseInt($('#J_home_stars').html()) - 1);
		                	var path = window.location.href;
	                        var pathArr = path.split('/');
	                        // 如果是粉丝页面
	                        if (pathArr[pathArr.length - 1] == '1ed1645edd706dc379effe13f3edcacf') {
	                        	$self.removeClass('ife_lsuserbtncancelstars');
	                        	$self.addClass('ife_lsuserbtnstars');
	                        	$self.html('<span>+</span><span>&nbsp;关注</span>');
	                        	var fansElem = $self.prev().prev().find('p span').eq(1);
                				fansElem.html(parseInt(fansElem.html()) - 1);
	                        	// 如果是关注页面
	                        } else if (pathArr[pathArr.length - 1] == 'a5df375d7c972248177e8b4407c8808c'){
	                        	_$parent.addClass('animated bounceOut');
		                        setTimeout(function () {
		                            _$parent.hide(500, function () {
		                                _$parent.remove();
		                            });
		                        }, 1000);
	                        }
	                        // 不是自己
		                } else {
		                	$self.removeClass('ife_lsuserbtncancelstars');
	                        $self.addClass('ife_lsuserbtnstars');
	                        $self.html('<span>+</span><span>&nbsp;关注</span>');
	                        window.location.href = window.location.href;
		                }
                    },
                    error: function(obj) {
                        window.printMsg('error', JSON.parse(obj.responseText).msg, true);
                    }
                });
            },
            cancel: function(){}
    	});
	});
};
// 添加关注
HomeUserInfo.prototype.stars = function () {
	$('.ife_lastestuser').on('click', '.ife_lsuserbtnstars', function () {
		var userid = $(this).data('userid');
		var $self = $(this);
		var _$parent = $(this).parent().parent();
		var fd = new FormData();
		fd.append('userid', userid);
		$.ajax({
            url: '/user/stars',
            type: 'POST',
            data: fd,
            processData: false,
            contentType: false,
            success: function (data) {
                window.printMsg('success', data.msg, true);
                // 如果是当前用户
                if ($('.ife_weibouserfocusbtn').length == 0) {
                	$('#J_home_stars').html(parseInt($('#J_home_stars').html()) + 1);
                	var fansElem = $self.prev().prev().find('p span').eq(1);
                	fansElem.html(parseInt(fansElem.html()) + 1);
                } else {
                	window.location.href = window.location.href;
                }
                $self.html('取消关注');
            	$self.removeClass('ife_lsuserbtnstars');
            	$self.addClass('ife_lsuserbtncancelstars');
                // _$parent.addClass('animated bounceOut');
            },
            error: function(obj) {
                window.printMsg('error', JSON.parse(obj.responseText).msg, true);
            }
        });
	});
};

HomeUserInfo.prototype.userInfoStars = function () {
	$('.ife_weiboUserInfo').on('click', '.J_weibouserfocusbtnStars', function () {
		var userid = $(this).data('userid');
		var $self = $(this);
		var fd = new FormData();
		fd.append('userid', userid);

		$.ajax({
            url: '/user/stars',
            type: 'POST',
            data: fd,
            processData: false,
            contentType: false,
            success: function (data) {
                window.printMsg('success', data.msg, true);
                $self.removeClass('J_weibouserfocusbtnStars').addClass('J_weibouserfocusbtnCancelStars');
                $self.html('取消关注');
                $('#J_home_fans').html(parseInt($('#J_home_fans').html()) + 1);
            },
            error: function(obj) {
                window.printMsg('error', JSON.parse(obj.responseText).msg, true);
            }
        });
	});
};

HomeUserInfo.prototype.userInfoCancelStars = function () {
	$('.ife_weiboUserInfo').on('click', '.J_weibouserfocusbtnCancelStars', function () {
		var $self = $(this);
		var userid = $(this).data('userid');
		$.confirm({
            autoClose: 'cancel|6000',
            title: '取消关注',
            confirmButton: '取消',
    		content: '您确定要取消对该用户的关注吗？',
            confirm: function(){
                $.ajax({
                    url: '/user/cancelStars',
                    type: 'DELETE',
                    data: {userid: userid},
                    success: function (data) {
                        window.printMsg('success', data.msg, true);
                        $self.removeClass('J_weibouserfocusbtnCancelStars').addClass('J_weibouserfocusbtnStars');
                        $self.html('<span>+</span><span>&nbsp;关注</span>');
                        $('#J_home_fans').html(parseInt($('#J_home_fans').html()) - 1);
                    },
                    error: function(obj) {
                        window.printMsg('error', JSON.parse(obj.responseText).msg, true);
                    }
                });
            },
            cancel: function(){}
    	});
	});
};
HomeUserInfo.prototype.findUser = function () {
	$('#J_findUserNavInputBtn').click(function () {
		var value = $('#J_findUserNavInput').val();
		$.ajax({
			url: '/home/find',
			type: 'POST',
			data: {username: value},
			success: function (data) {
                window.printMsg('success', data.msg, true);
                window.location.href = window.location.protocol + '//' + window.location.host + '/home/detail/' + data.userid + '/92a2b5cb9c6906035c2864fa225e1940';
            },
            error: function(obj) {
                window.printMsg('error', JSON.parse(obj.responseText).msg, true);
            }
		})
	});
};
var homeUserInfo = new HomeUserInfo();
homeUserInfo.initPagination();
homeUserInfo.bindScroll();
homeUserInfo.bindClick();
homeUserInfo.bindChange();
homeUserInfo.cancelStars();
homeUserInfo.stars();
homeUserInfo.userInfoStars();
homeUserInfo.userInfoCancelStars();
homeUserInfo.findUser();
