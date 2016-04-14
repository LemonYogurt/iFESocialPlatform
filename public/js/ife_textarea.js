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
					$('#J_publicTextarea').css('background', 'rgba(255, 144, 144, 0.5)');
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

publishContent.prototype.uploadPicBtn = function () {
	$('#J_content_fileUpload').click(function () {
		var _$elem = $('.ife_fileUploadTooltip');
		var flag = _$elem.is(':hidden');
		if (flag) {
			_$elem.show(500);
		} else {
			_$elem.hide(500);
		}
	});

	$(document).click(function (e) {
		if ($(e.target).closest('.ife_fileUploadTooltip').length != 1 && $(e.target).closest('#J_content_fileUpload').length != 1) {
			$('.ife_fileUploadTooltip').hide(500);
		}
	});
	$('#J_closePublishPic').click(function () {
		$('.ife_fileUploadTooltip').hide(500);
	});
};

publishContent.prototype.uploadPic = function () {
	$('#J_fileUploadPic').click(function () {
		if($('#J_publishPic').length > 0) {
			$('#J_publishPic').change(function (e) {
				var pic = e.target.files[0];
				var imgRep = /^image\/(jpeg|jpg|gif|png|bmp$)/i;
				if (imgRep.test(pic.type)) {
					var fr = new FileReader();
					fr.readAsDataURL(pic);
					// 首先进行本地预览，本地预览成功后，上传到服务器
					fr.onload = function () {
						$('#J_fileUploadPic img').attr('src', this.result);
						$('#J_fileUploadPic img').show();

						window.message['success']('图片本地预览成功');
						$('.ife_fileUploadControl p').html('已上传图片');
						$('#J_publishPic').remove();
					};
				}
			});
			$('#J_publishPic').click();
		}
	});
};


var pc = new publishContent();
pc.initTextArea();
pc.publicBtn();
pc.faceBtn();
pc.uploadPicBtn();
pc.uploadPic();