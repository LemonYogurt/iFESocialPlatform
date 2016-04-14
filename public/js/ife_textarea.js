function publishContent() {
	this.flag = true;
	this.time = null;
	this.ie = !-[1,];
	this.iNum = 0;
}
publishContent.prototype.getLength = function (str) {
	// 检查是否汉字或者全角
	return String(str).replace(/[^\x00-\xff]/g,'aa').length;
}
publishContent.prototype.toChange = function (obj) {
	var num = Math.ceil(publishContent.prototype.getLength($('#J_publicTextarea').val()) / 2);
	var _$span = $('#J_content_titletxt span');
	if (_$span.length < 1) {
		return
	}
	if(num<=140){
		_$span.html(140 - num);
		_$span.css('color', '');
	} else {
		_$span.html(num - 140);
		_$span.css('color', 'red');
	}
	if($('#J_publicTextarea').val() == '' || num > 140){
		$('#J_publicBtn').removeClass('ife_publicBtnValue');
	} else{
		$('#J_publicBtn').addClass('ife_publicBtnValue');
	}
};

publishContent.prototype.initTextArea = function () {
	var self = this;
	$('#J_publicTextarea').focus(function () {
		if (self) {
			$('#J_content_titletxt').css('top', '14px');
			$('#J_content_titletxt').html('还可以输入<span>140</span>字');
			self.flag = false;
		}
	});
	$('#J_publicTextarea').blur(function () {
		if ($('#J_publicTextarea').val() == '') {
			$('#J_content_titletxt').css('top', '22px');
			$('#J_content_titletxt').html('iFE社交平台');
			self.flag = true;
		}
	});

	if (self.ie) {
		$('#J_publicTextarea')[0].onpropertychange = self.toChange;
	} else {
		$('#J_publicTextarea')[0].oninput = self.toChange;
	}
};


publishContent.prototype.publicBtn = function () {
	var self = this;
	$('#J_publicBtn').click(function () {
		if(!$(this).hasClass('ife_publicBtnValue')){
			clearInterval(self.timer);
			self.timer = setInterval(function(){
				if(self.iNum == 5){
					clearInterval(self.timer);
					self.iNum = 0;
				} else{
					self.iNum++;
				}
				
				if(self.iNum % 2){
					$('#J_publicTextarea').css('background', '#f99');
				} else{
					$('#J_publicTextarea').css('background', '');	
				}
			},100);
		} else{
			console.log('发布成功');
		}
	});
}

publishContent.prototype.faceBtn = function () {
	$('#J_content_faceicon').click(function () {
		var _$elem = $('.ife_face_con');
		var flag = _$elem.is(':hidden');
		if (flag) {
			_$elem.show(500);
		} else {
			_$elem.hide(500);
		}
	});

	$(document).click(function (e) {
		if ($(e.target).closest('.ife_face_con').length != 1 && $(e.target).closest('#J_content_faceicon').length != 1) {
			$('.ife_face_con').hide(500);
		}
	});
}

var pc = new publishContent();
pc.initTextArea();
pc.publicBtn();
pc.faceBtn();