$('#J_userAvatar').click(function (e) {
	if ($('#J_uploadAvatar').length) {
		$('#J_uploadAvatar').click();
	}
});
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
						window.message['error'](window.message.infoCode['avatarUploadError']);
						$('#J_userAvatar').attr('src', '/images/defaultAvatar.png');
					}
				});
			}, 1000);
		};
	} else {
		window.message['error'](window.message.infoCode['avatarError']);
	}
});