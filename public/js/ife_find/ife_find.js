function HomeUserInfo() {}

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
                        $('#J_starsCount').html(parseInt($('#J_starsCount').html()) - 1);
	                	$self.removeClass('ife_lsuserbtncancelstars');
                    	$self.addClass('ife_lsuserbtnstars');
                    	$self.html('<span>+</span><span>&nbsp;关注</span>');
                    	var fansElem = $self.prev().prev().find('p span').eq(1);
        				fansElem.html(parseInt(fansElem.html()) - 1);
                        window.location.href = window.location.href;
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
                $('#J_starsCount').html(parseInt($('#J_starsCount').html()) + 1);
            	var fansElem = $self.prev().prev().find('p span').eq(1);
            	fansElem.html(parseInt(fansElem.html()) + 1);
                $self.html('取消关注');
            	$self.removeClass('ife_lsuserbtnstars');
            	$self.addClass('ife_lsuserbtncancelstars');
                // _$parent.addClass('animated bounceOut');
                window.location.href = window.location.href;
            },
            error: function(obj) {
                window.printMsg('error', JSON.parse(obj.responseText).msg, true);
            }
        });
	});
};

// 找人功能
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
homeUserInfo.cancelStars();
homeUserInfo.stars();
homeUserInfo.findUser();