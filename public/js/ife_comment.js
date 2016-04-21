function CommentComponent() {
	this.timer = null;
	this.iNum = 0; // 用于定时器计数
}

CommentComponent.prototype.publishTextarea = function () {
	$('.ife_rightMain').on('focus', '.ife_comment_content_hiddenInput', function (e) {
		var _$elem = $(e.target).closest('.ife_comment_content_hiddenInput');
		// 移除回复提示内容
		_$elem.next().find('.ife_comment_content_input .J_reply_comment_tip').remove();
		_$elem.next().find('.ife_comment_content_input .ife_comment_content_ta').css('textIndent', '');
		_$elem.hide(200);
		_$elem.next().show(500, function () {
			_$elem.next().find('.ife_comment_content_ta').focus();
		});
	});
	$(document).click(function (e) {
		if ($(e.target).closest('.ife_comment_content_publish').length != 1 && $(e.target).closest('.ife_article_comment_operate').length != 1 && $(e.target).closest('.ife_article_scomment_operate').length  != 1) {
			$('.ife_comment_content_inputbox').hide(500);
			$('.ife_comment_content_hiddenInput').show(500);
		}
	});
};

CommentComponent.prototype.addFaceIcon = function () {
	$('.ife_rightMain').on('click', '.J_comment_face_icon', function () {
		var _$elem = $(this).next();
		console.log(_$elem);
        var flag = _$elem.is(':hidden');
        if (flag) {
            _$elem.show(500);
        } else {
            _$elem.hide(500);
        }
	});
	$(document).click(function(e) {
        if ($(e.target).closest('.ife_comment_face_con').length != 1 && $(e.target).closest('.J_comment_face_icon').length != 1) {
            $('.ife_comment_face_con').hide(500);
        }
    });
};

// 添加表情
CommentComponent.prototype.appendFace = function() {
	$('.ife_rightMain').on('click', '.ife_comment_face_con li', function () {
		var img = $(this).find("img").clone();
		var $appendElem = $(this).parent().parent().parent().prev().find('.ife_comment_content_ta');
		var _$publishBtn = $(this).parent().parent().next();
		$appendElem.append(img);
		$appendElem.focus();
		if ($appendElem.html() == '') {
       		_$publishBtn.removeClass('ife_comment_publishBtnValue');
	    } else {
	        // 否则的话，就增加可显示样式
	        _$publishBtn.addClass('ife_comment_publishBtnValue');
	    }
	});
};

CommentComponent.prototype.initTextarea = function () {
	$('.ife_rightMain').on('keyup', '.ife_comment_content_input .ife_comment_content_ta', function () {
		var _$publishBtn = $(this).parent().next().find('.ife_comment_publishBtn');
		if ($(this).html() == '') {
       		_$publishBtn.removeClass('ife_comment_publishBtnValue');
	    } else {
	        // 否则的话，就增加可显示样式
	        _$publishBtn.addClass('ife_comment_publishBtnValue');
	    }
	});
};

// 发表按钮
CommentComponent.prototype.initPublishBtn = function () {
	var self = this;
	$('.ife_rightMain').on('click', '.ife_comment_publishBtn', function () {
		var _$publishBtn = $(this);
		var _$articleContent = _$publishBtn.parent().parent().parent().parent().parent();
		var _$articleTextBox = _$articleContent.find('.ife_article_text_box');
		var _$textarea = _$publishBtn.parent().prev().find('.ife_comment_content_ta');
		// 如果length不等于1，说明，是发表新的评论
		if (_$articleTextBox.find('.J_reply_comment_tip').length < 1) {
			if (!_$publishBtn.hasClass('ife_comment_publishBtnValue')) {
				clearInterval(self.timer);
	            self.timer = setInterval(function() {
	                if (self.iNum == 5) {
	                    clearInterval(self.timer);
	                    self.iNum = 0;
	                } else {
	                    self.iNum++;
	                }

	                if (self.iNum % 2) {
	                    _$textarea.css('background', 'rgba(255, 144, 144, 0.5)');
	                } else {
	                    _$textarea.css('background', '');
	                }
	            }, 100);
			} else {
				// 只在发表按钮上缓存文章的用户id和文章的id
				var userid = _$publishBtn.data('userid');
				var articleid = _$publishBtn.data('articleid');
				var content = _$textarea.html();
				$.ajax({
					url: '/comment/normal',
					type: 'POST',
					data: {userid: userid, articleid: articleid, content: content},
					success: function (data) {
						window.printMsg('success', data.msg, true);
						delete data.msg;
						var commentStr = '<div class="ife_article_comment_list" data-commentid="'+data.commentid+5+'">\
							                  <div user="self" class="ife_article_comment_box clearfix"><img src="'+data.avatar+'" alt="我的头像" width="40" height="40" class="ife_article_commentAvatar">\
							                    <div class="ife_article_comment_content">\
							                      <div class="ife_article_comment_text clearfix"><strong class="ife_article_comment_username">我：</strong>\
							                        <p class="ife_article_comment_txt">'+data.content+'</p>\
							                      </div>\
							                      <p class="ife_article_comment_time"><em class="ife_article_comment_relatime">'+moment(new Date(data.createAt)).calendar()+'</em><a href="javascript:void(0);" total="0" my="0" class="ife_article_comment_praise" data-commentid="'+data.commentid+'">赞</a><a href="javascript:void(0);" class="ife_article_comment_operate" data-userid="'+data.from+'" data-commentid="'+data.commentid+'">删除</a></p>\
							                    </div>\
							                  </div>\
							                </div>';
		                var otherCommentStr = '<div class="ife_article_comment_list" data-commentid="'+data.commentid+'">\
							                  <div user="other" class="ife_article_comment_box clearfix"><img src="'+data.avatar+'" alt="我的头像" width="40" height="40" class="ife_article_commentAvatar">\
							                    <div class="ife_article_comment_content">\
							                      <div class="ife_article_comment_text clearfix"><strong class="ife_article_comment_username">其他：</strong>\
							                        <p class="ife_article_comment_txt">'+data.content+'</p>\
							                      </div>\
							                      <p class="ife_article_comment_time"><em class="ife_article_comment_relatime">'+moment(new Date(data.createAt)).calendar()+'</em><a href="javascript:void(0);" total="0" my="0" class="ife_article_comment_praise" data-commentid="'+data.commentid+'">赞</a><a href="javascript:void(0);" class="ife_article_comment_operate" data-userid="'+data.from+'" data-commentid="'+data.commentid+'">回复</a></p>\
							                    </div>\
							                  </div>\
							                </div>';
		                _$articleTextBox.before(otherCommentStr);
		                _$articleTextBox.before(commentStr);
		                _$textarea.html('');
		                _$textarea.parent().parent().hide(500,function () {
		                	_$textarea.parent().parent().prev().show();
		                });

					},
					error: function (obj) {
						window.printMsg('error', JSON.parse(obj.responseText).msg, true);
					}
				});
			}
			// 如果等于1的话，表示是回复
		} else {
			var _$replySpan = _$articleTextBox.find('.J_reply_comment_tip');
			// 要回复的评论id
			var commentid = _$replySpan.data('commentid');
			// 要回复的用户id
			var userid = _$replySpan.data('userid');
			// 得要回复的内容
			var content = _$textarea.html();
			var _$targetComment = null;
			console.log(_$replySpan);
			$.ajax({
				url: '/comment/replyComment',
				type: 'POST',
				data: {commentid: commentid, to: userid, content: content},
				success: function (data) {
					window.printMsg('success', data.msg, true);
					var strReplyCommentTest = '<div data-scommentid="'+data.replycommentid+'" data-userid="'+data.from+'" user="self" class="ife_article_scomment_box clearfix"><img src="/images/my.jpg" alt="我的头像" width="40" height="40" class="ife_article_scommentAvatar">\
			                        <div class="ife_article_scomment_content">\
			                          <div class="ife_article_scomment_text clearfix"><strong class="ife_article_scomment_username">我：&nbsp;回复&nbsp;他：</strong>\
			                            <p class="ife_article_scomment_txt">'+data.content+'</p>\
			                          </div>\
			                          <p class="ife_article_scomment_time"><em class="ife_article_scomment_relatime">'+moment(new Date(data.createAt)).calendar()+'</em><a href="javascript:void(0);" total="0" my="0" class="ife_article_scomment_praise" data-scommentid="'+data.replycommentid+'" data-userid="'+data.from+'">赞</a><a href="javascript:void(0);" class="ife_article_scomment_operate" data-scommentid="'+data.replycommentid+'" data-userid="'+data.from+'">回复</a></p>\
			                        </div>\
			                      </div>';
					var strReplyComment = '<div data-scommentid="'+data.replycommentid+5+'" data-userid="'+data.from+'" user="self" class="ife_article_scomment_box clearfix"><img src="/images/my.jpg" alt="我的头像" width="40" height="40" class="ife_article_scommentAvatar">\
			                        <div class="ife_article_scomment_content">\
			                          <div class="ife_article_scomment_text clearfix"><strong class="ife_article_scomment_username">我：&nbsp;回复&nbsp;他：</strong>\
			                            <p class="ife_article_scomment_txt">'+data.content+'</p>\
			                          </div>\
			                          <p class="ife_article_scomment_time"><em class="ife_article_scomment_relatime">'+moment(new Date(data.createAt)).calendar()+'</em><a href="javascript:void(0);" total="0" my="0" class="ife_article_scomment_praise" data-scommentid="'+data.replycommentid+'" data-userid="'+data.from+'">赞</a><a href="javascript:void(0);" class="ife_article_scomment_operate" data-scommentid="'+data.replycommentid+'" data-userid="'+data.from+'">删除</a></p>\
			                        </div>\
			                      </div>';
			         _$articleContent.find('.ife_article_comment_list').each(function (i, v) {
		            	if ($(v).data('commentid') == commentid) {
		            		_$targetComment = $(v);
		            		return;
		            	}
		            });
		            if (_$targetComment) {
		            	_$targetComment.find('.ife_article_comment_content').append(strReplyCommentTest);
		            	_$targetComment.find('.ife_article_comment_content').append(strReplyComment);
		            	// 删除回复提示元素
		            	_$replySpan.remove();
		            	// 清空编辑框中的内容
		            	_$textarea.html('');
		            	// 关闭编辑框
		            	_$textarea.parent().parent().hide(500, function () {
		            		_$textarea.parent().parent().prev().show();
		            	});
		            }
				},
				error: function (obj) {
					window.printMsg('error', JSON.parse(obj.responseText).msg, true);
				}
			});
		}
	});
}

// 增加赞和撤销赞
CommentComponent.prototype.addPraise = function () {
	$('.ife_rightMain').on('click', '.ife_article_comment_praise', function () {
		var oldTotal = parseInt($(this).attr('total'));
		var my = parseInt($(this).attr('my'));
		var commentid = $(this).data('commentid');
		var newTotal;
		var self = this;
		if (my === 0) {
			$.ajax({
				url: '/comment/addPraise',
				type:'POST',
				data: {commentid: commentid},
				success: function (data) {
					window.printMsg('success', data.msg, true);
					console.log(oldTotal);
					newTotal = oldTotal + 1;
					$(self).attr('total', newTotal);
					$(self).attr('my', 1);
					$(self).html(newTotal + '取消赞');
					$(self).css('display', newTotal === 0 ? '' : 'inline-block');
				},
				error: function (obj) {
					window.printMsg('error', JSON.parse(obj.responseText).msg, true);
				}
			});
		} else {
			$.ajax({
				url: '/comment/cancelPraise',
				type:'POST',
				data: {commentid: commentid},
				success: function (data) {
					window.printMsg('success', data.msg, true);
					newTotal = oldTotal - 1;
					$(self).attr('total', newTotal);
					$(self).attr('my', 0);
					// 如果没有人赞过，就没有必要显示0了，如果有人赞过，就显示赞的数目
					$(self).html(newTotal === 0 ? '赞' : newTotal + ' 赞');
					$(self).css('display', newTotal === 0 ? '' : 'inline-block');
				},
				error: function (obj) {
					window.printMsg('error', JSON.parse(obj.responseText).msg, true);
				}
			});
		}
	});
};

// 增加和取消子评论的赞
CommentComponent.prototype.addReplyPraise = function () {
	$('.ife_rightMain').on('click', '.ife_article_scomment_praise', function () {
		var oldTotal = parseInt($(this).attr('total'));
		var my = parseInt($(this).attr('my'));
		var scommentid = $(this).data('scommentid');
		console.log('增加子回复赞');
		var newTotal;
		var self = this;
		if (my === 0) {
			$.ajax({
				url: '/comment/addReplyPraise',
				type:'POST',
				data: {scommentid: scommentid},
				success: function (data) {
					window.printMsg('success', data.msg, true);
					console.log(oldTotal);
					newTotal = oldTotal + 1;
					$(self).attr('total', newTotal);
					$(self).attr('my', 1);
					$(self).html(newTotal + '取消赞');
					$(self).css('display', newTotal === 0 ? '' : 'inline-block');
				},
				error: function (obj) {
					window.printMsg('error', JSON.parse(obj.responseText).msg, true);
				}
			});
		} else {
			$.ajax({
				url: '/comment/cancelReplyPraise',
				type:'POST',
				data: {scommentid: scommentid},
				success: function (data) {
					window.printMsg('success', data.msg, true);
					newTotal = oldTotal - 1;
					$(self).attr('total', newTotal);
					$(self).attr('my', 0);
					// 如果没有人赞过，就没有必要显示0了，如果有人赞过，就显示赞的数目
					$(self).html(newTotal === 0 ? '赞' : newTotal + ' 赞');
					$(self).css('display', newTotal === 0 ? '' : 'inline-block');
				},
				error: function (obj) {
					window.printMsg('error', JSON.parse(obj.responseText).msg, true);
				}
			});
		}
	});
};

// 注意：子评论赞缓存的是当前子评论的id和子评论的from用户id
// 
// 回复和删除子评论的功能：
CommentComponent.prototype.replySComment = function () {
	$('.ife_rightMain').on('click', '.ife_article_scomment_operate', function () {
		// 获取文本框
		// str回复提示框：
		var scommentid = $(this).data('scommentid');
		var userid = $(this).data('userid');
		var _$mainComment = $(this).parent().parent().parent().parent().parent().parent();
		var commentid = _$mainComment.data('commentid');
		var _$articleContent = _$mainComment.parent();
		var _$textareaHiddenElem = _$articleContent.find('.ife_comment_content_hiddenInput');
		var _$textBox = _$articleContent.find('.ife_comment_content_inputbox');
		var _$textareaElem = _$articleContent.find('.ife_comment_content_input .ife_comment_content_ta');
		if (_$articleContent.find('.J_reply_comment_tip').length > 0) {
			_$articleContent.find('.J_reply_comment_tip').remove();
		}
		var replyUsername = '燕婈姣';
		var str = '<span class="J_reply_comment_tip" data-commentid="'+commentid+'" data-userid="'+userid+'">回复&nbsp;<span>'+replyUsername+'：</span></span>'
		if ($(this).html() == '删除') {
		} else if ($(this).html() == '回复') {
			_$textareaHiddenElem.hide();
			_$textBox.show(500, function() {
				_$textareaElem.focus();
				_$textareaElem.after(str);
				_$textareaElem.css('textIndent', '7em');
			});
		}
	});
};

// 回复和删除功能：
// 要在操作按钮上得到评论的id和当前评论用户的id
CommentComponent.prototype.replyComment = function () {
	$('.ife_rightMain').on('click', '.ife_article_comment_operate', function () {
		// 获取文本框
		// str回复提示框：
		var commentid = $(this).data('commentid');
		var userid = $(this).data('userid');
		var _$articleContent = $(this).parent().parent().parent().parent().parent();
		var _$textareaHiddenElem = _$articleContent.find('.ife_comment_content_hiddenInput');
		var _$textBox = _$articleContent.find('.ife_comment_content_inputbox');
		var _$textareaElem = _$articleContent.find('.ife_comment_content_input .ife_comment_content_ta');
		if (_$articleContent.find('.J_reply_comment_tip').length > 0) {
			_$articleContent.find('.J_reply_comment_tip').remove();
		}
		var replyUsername = '燕婈姣';
		var str = '<span class="J_reply_comment_tip" data-userid="'+userid+'" data-commentid="'+commentid+'">回复&nbsp;<span>'+replyUsername+'：</span></span>'
		if ($(this).html() == '删除') {
		} else if ($(this).html() == '回复') {
			_$textareaHiddenElem.hide();
			_$textBox.show(500, function() {
				_$textareaElem.focus();
				_$textareaElem.after(str);
				_$textareaElem.css('textIndent', '7em');
			});
		}
	});
};


var comment = new CommentComponent();
comment.publishTextarea();
comment.addFaceIcon();
comment.appendFace();
comment.initTextarea();
comment.initPublishBtn();
comment.addPraise();
comment.replyComment();
comment.addReplyPraise();
comment.replySComment();