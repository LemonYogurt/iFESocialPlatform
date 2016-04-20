$('.J_sideBodyFollowBtn').click(function (e) {
	var self = this;
	var fd = new FormData();
	fd.append('userid', $(this).data().userid)
	$.ajax({
		url: '/user/stars',
		type: 'POST',
		data: fd,
		processData: false,
		contentType: false,
		success: function (data) {
			window.printMsg('success', data.msg, true);
			// 将关注的人数加1
			// 将当前的用户移除，动画隐藏
			$('#J_starsCount').html($('#J_starsCount').html() - 0 + 1);
			$(this).parent().prev().hide(500);
			$(self).parent().hide(500, function () {
				$(self).parent().prev().remove();
				$(self).parent().remove();
			});
			// 上面既然移除了li，下面就要再显示出li来，将下面隐藏的li显示出来
			if ($('.J_sideLiEmptyhidden').length > 0) {
				$('.J_sideLiEmptyhidden').eq(0).removeClass('J_sideLiEmptyhidden');
				$('.J_sideLiUserInfoHidden').eq(0).addClass('J_sideLiUserCount').removeClass('J_sideLiUserInfoHidden');
			}
			// 判断如果此时最新注册的用户数量小于6个的话，就把最后的查看最多按钮隐藏起来
			if ($('.J_sideLiUserCount').length <= 6) {
				$('.findMoreUser').hide();
			}
		},
		error: function (obj) {
			window.printMsg('error', JSON.parse(obj.responseText).msg, true);
		}
	});
	
	// <span>+</span><span>&nbsp;关注</span>
	// console.log($(this).find('a').html('<span>+</span><span>&nbsp;取消关注</span>'));
	
});