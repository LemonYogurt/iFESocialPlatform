toastr.options = {
  "closeButton": true,
  "debug": false,
  "newestOnTop": false,
  "progressBar": false,
  "positionClass": "toast-top-right",
  "preventDuplicates": false,
  "onclick": null,
  "showDuration": "300",
  "hideDuration": "300",
  "timeOut": "1000",
  "extendedTimeOut": "1000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
}
/* success info warning error */
toastr.infoCode = {
  "emailError": "您的电子邮件格式不正确",
  "emailEmpty": "请填写您的电子邮件",
  "emailExist": "该电子邮件已被注册",
  "userError": "亲，昵称必须是中英文字符",
  "userEmpty": "亲，请填写您的昵称",
  "userExist": "亲，该昵称已存在",
  "registerSuccess": "注册成功",
  "registerError": "注册失败",
  "loginError": "登录失败",
  "loginSuccess": "登录成功",
  "passwordError": "亲密码最少6位^_^",
  "avatarError": "请选择图片格式",
  "avatarLocal": "正在进行本地预览",
  "avatarLocalSuccess": "本地预览成功",
  "avatarUpload": "头像正在上传服务器",
  "avatarUploadSuccess": "头像上传服务器成功",
  "avatarUploadError": "头像上传服务器失败"
};
window.message = toastr;