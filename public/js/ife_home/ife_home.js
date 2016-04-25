function HomeUserInfo() {}

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
				window.message['success'](window.message.infoCode['avatarLocalSuccess']);
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
                        $('#J_home_stars').html(parseInt($('#J_home_stars').html()) - 1);
                        var path = window.location.href;
                        var pathArr = path.split('/');
                        if (pathArr[pathArr.length - 1] == '1ed1645edd706dc379effe13f3edcacf') {
                        	$self.html('<span>+</span><span>&nbsp;关注</span>');
                        } else if (pathArr[pathArr.length - 1] == 'a5df375d7c972248177e8b4407c8808c'){
                        	_$parent.addClass('animated bounceOut');
	                        setTimeout(function () {
	                            _$parent.hide(500, function () {
	                                _$parent.remove();    
	                            });
	                        }, 1000);
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
                $('#J_home_stars').html(parseInt($('#J_home_stars').html()) + 1);
                // _$parent.addClass('animated bounceOut');
                $self.html('取消关注');
            },
            error: function(obj) {
                window.printMsg('error', JSON.parse(obj.responseText).msg, true);
            }
        });
	});
};
var homeUserInfo = new HomeUserInfo();
homeUserInfo.bindClick();
homeUserInfo.bindChange();
homeUserInfo.cancelStars();
homeUserInfo.stars();