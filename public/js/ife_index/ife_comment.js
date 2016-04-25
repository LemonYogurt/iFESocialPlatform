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
						/*
							articleid
							:
							"571a13835ce7c4cd4dd84833"
							avatar
							:
							"/images/ife_userDefaultAvatar_little.gif"
							commentid
							:
							"571a13885ce7c4cd4dd84834"
							content
							:
							"呵呵打"
							createAt
							:
							"Fri Apr 22 2016 20:05:28 GMT+0800 (CST)"
							from
							:
							"57161e84c9f38d924576f66e"
							praise
							:
							""
							reply
							:
							""
							to
							:
							"57161e84c9f38d924576f66e"
						*/
						var commentStr = '<div class="ife_article_comment_list" data-commentid="'+data.commentid+'">\
							                  <div user="self" class="ife_article_comment_box clearfix"><img src="'+data.avatar+'" alt="头像" width="40" height="40" class="ife_article_commentAvatar">\
							                    <div class="ife_article_comment_content">\
							                      <div class="ife_article_comment_text clearfix"><strong class="ife_article_comment_username">我：</strong>\
							                        <p class="ife_article_comment_txt">'+data.content+'</p>\
							                      </div>\
							                      <p class="ife_article_comment_time"><em class="ife_article_comment_relatime">'+moment(new Date(data.createAt)).fromNow()+'</em><a href="javascript:void(0);" total="0" my="0" class="ife_article_comment_praise" data-commentid="'+data.commentid+'">赞</a><a href="javascript:void(0);" class="ife_article_comment_operate" data-userid="'+data.from+'" data-commentid="'+data.commentid+'" data-articleid="'+data.articleid+'">删除</a></p>\
							                    </div>\
							                  </div>\
							                </div>';
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
			// 要回复的用户名
			var username = _$replySpan.data('username');
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
					var strReplyComment = '<div data-scommentid="'+data.replycommentid+'" data-userid="'+data.from+'" user="self" class="ife_article_scomment_box clearfix"><img src="'+data.avatar+'" alt="头像" width="40" height="40" class="ife_article_scommentAvatar">\
			                        <div class="ife_article_scomment_content">\
			                          <div class="ife_article_scomment_text clearfix"><strong class="ife_article_scomment_username">我：&nbsp;回复&nbsp;'+username+'：</strong>\
			                            <p class="ife_article_scomment_txt">'+data.content+'</p>\
			                          </div>\
			                          <p class="ife_article_scomment_time"><em class="ife_article_scomment_relatime">'+moment(new Date(data.createAt)).fromNow()+'</em><a href="javascript:void(0);" total="0" my="0" class="ife_article_scomment_praise" data-scommentid="'+data.replycommentid+'" data-userid="'+data.from+'">赞</a><a href="javascript:void(0);" class="ife_article_scomment_operate" data-scommentid="'+data.replycommentid+'" data-userid="'+data.from+'" data-commentid="'+data.commentid+'">删除</a></p>\
			                        </div>\
			                      </div>';
			         _$articleContent.find('.ife_article_comment_list').each(function (i, v) {
		            	if ($(v).data('commentid') == commentid) {
		            		_$targetComment = $(v);
		            		return;
		            	}
		            });
		            if (_$targetComment) {
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
					$(self).html(newTotal + '&nbsp;取消赞');
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

// 注意：子评论赞缓存的是当前子评论的id和当前用户的id
// 
// 回复和删除子评论的功能：
CommentComponent.prototype.replySComment = function () {
	$('.ife_rightMain').on('click', '.ife_article_scomment_operate', function () {
		// 获取文本框
		// str回复提示框：
		var scommentid = $(this).data('scommentid');
		var username = $(this).data('username');
		var userid = $(this).data('userid');
		var $currentSComment = $(this).parent().parent().parent();
		var _$mainComment = $(this).parent().parent().parent().parent().parent().parent();
		var commentid = _$mainComment.data('commentid');
		var _$articleContent = _$mainComment.parent();
		var _$textareaHiddenElem = _$articleContent.find('.ife_comment_content_hiddenInput');
		var _$textBox = _$articleContent.find('.ife_comment_content_inputbox');
		var _$textareaElem = _$articleContent.find('.ife_comment_content_input .ife_comment_content_ta');
		if (_$articleContent.find('.J_reply_comment_tip').length > 0) {
			_$articleContent.find('.J_reply_comment_tip').remove();
		}
		// 这里缓存commentid是因为子评论最终要挂载的位置就是主评论下面
		var str = '<span class="J_reply_comment_tip" data-username="'+username+'" data-commentid="'+commentid+'" data-userid="'+userid+'">回复&nbsp;<span>'+username+'：</span></span>'
		if ($(this).html() == '删除') {
			$.confirm({
	            autoClose: 'cancel|6000',
	            title: '删除回复',
        		content: '您确定要删除该回复吗？',
	            confirm: function(){
	                $.ajax({
	                    url: '/comment/sdel',
	                    type: 'DELETE',
	                    data: {userid: userid, commentid: commentid, scommentid: scommentid},
	                    success: function (data) {
	                        window.printMsg('success', data.msg, true);
	                        $currentSComment.addClass('animated bounceOut');
	                        setTimeout(function () {
	                            $currentSComment.hide(500, function () {
	                                $currentSComment.remove();    
	                            });
	                        }, 1000);
	                    },
	                    error: function(obj) {
	                        window.printMsg('error', JSON.parse(obj.responseText).msg, true);
	                    }
	                });
	            },
	            cancel: function(){}
        	});
		} else if ($(this).html() == '回复') {
			_$textareaHiddenElem.hide();
			_$textBox.show(500, function() {
				_$textareaElem.focus();
				_$textareaElem.after(str);
				_$textareaElem.css('textIndent', _$textareaElem.next().width() + 'px');
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
		var articleid = $(this).data('articleid');
		// 这里的username指的是需要回复的用户名
		var username = $(this).data('username');
		// 要回复的用户id
		var userid = $(this).data('userid');
		var $currentComment = $(this).parent().parent().parent().parent();
		var _$articleContent = $(this).parent().parent().parent().parent().parent();
		var _$textareaHiddenElem = _$articleContent.find('.ife_comment_content_hiddenInput');
		var _$textBox = _$articleContent.find('.ife_comment_content_inputbox');
		var _$textareaElem = _$articleContent.find('.ife_comment_content_input .ife_comment_content_ta');
		if (_$articleContent.find('.J_reply_comment_tip').length > 0) {
			_$articleContent.find('.J_reply_comment_tip').remove();
		}
		var str = '<span class="J_reply_comment_tip" data-username="'+username+'" data-userid="'+userid+'" data-commentid="'+commentid+'">回复&nbsp;<span>'+username+'：</span></span>'
		if ($(this).html() == '删除') {
			$.confirm({
	            autoClose: 'cancel|6000',
	            title: '删除评论',
        		content: '您确定要删除该评论吗？',
	            confirm: function(){
	                $.ajax({
	                    url: '/comment/del',
	                    type: 'DELETE',
	                    data: {userid: userid, articleid: articleid, commentid: commentid},
	                    success: function (data) {
	                        window.printMsg('success', data.msg, true);
	                        // $currentComment.hide(500, function () {
                         //        $currentComment.remove();    
                         //    });
	                        $currentComment.addClass('animated bounceOut');
	                        setTimeout(function () {
	                            $currentComment.hide(500, function () {
	                                $currentComment.remove();    
	                            });
	                        }, 1000);
	                    },
	                    error: function(obj) {
	                        window.printMsg('error', JSON.parse(obj.responseText).msg, true);
	                    }
	                });
	            },
	            cancel: function(){}
        	});
		} else if ($(this).html() == '回复') {
			_$textareaHiddenElem.hide();
			_$textBox.show(500, function() {
				_$textareaElem.focus();
				_$textareaElem.after(str);
				_$textareaElem.css('textIndent', _$textareaElem.next().width() + 'px');
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