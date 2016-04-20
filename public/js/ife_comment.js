function CommentComponent() {
	this.timer = null;
	this.iNum = 0; // 用于定时器计数
}

CommentComponent.prototype.publishTextarea = function () {
	$('.ife_rightMain').on('focus', '.ife_comment_content_hiddenInput', function (e) {
		var _$elem = $(e.target).closest('.ife_comment_content_hiddenInput');
		_$elem.hide(200);
		_$elem.next().show(500, function () {
			_$elem.next().find('.ife_comment_content_ta').focus();
		});
	});
	$(document).click(function (e) {
		if ($(e.target).closest('.ife_comment_content_publish').length != 1) {
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
       		_$publishBtn.removeClass('ife_comment_publicBtnValue');
	    } else {
	        // 否则的话，就增加可显示样式
	        _$publishBtn.addClass('ife_comment_publicBtnValue');
	    }
	});
};

CommentComponent.prototype.initTextarea = function () {
	$('.ife_rightMain').on('keyup', '.ife_comment_content_input .ife_comment_content_ta', function () {
		var _$publishBtn = $(this).parent().next().find('.ife_comment_publicBtn');
		if ($(this).html() == '') {
       		_$publishBtn.removeClass('ife_comment_publicBtnValue');
	    } else {
	        // 否则的话，就增加可显示样式
	        _$publishBtn.addClass('ife_comment_publicBtnValue');
	    }
	});
};

CommentComponent.prototype.initPublishBtn = function () {
	var self = this;
	$('.ife_rightMain').on('click', '.ife_comment_publicBtn', function () {
		var _$publishBtn = $(this);
		var _$textarea = _$publishBtn.parent().prev().find('.ife_comment_content_ta');
		if (!_$publishBtn.hasClass('ife_comment_publicBtnValue')) {
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
			console.log('老子要放大找了');
		}
	});
}

var comment = new CommentComponent();
comment.publishTextarea();
comment.addFaceIcon();
comment.appendFace();
comment.initTextarea();
comment.initPublishBtn();
