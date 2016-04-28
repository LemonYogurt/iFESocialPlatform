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
homeUserInfo.bindClick();
homeUserInfo.bindChange();
homeUserInfo.cancelStars();
homeUserInfo.stars();
homeUserInfo.userInfoStars();
homeUserInfo.userInfoCancelStars();
homeUserInfo.findUser();