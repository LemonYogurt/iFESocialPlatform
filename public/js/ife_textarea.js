function publishContent() {
    this.flag = true; // 用于判断是否应该显示右上角的字数提示
    this.time = null; // 定义定时器
    this.ie = !-[1, ]; // 判断是否是ie浏览器
    this.iNum = 0; // 用于定时器计数
    this.articlePic = null; // 用于存放全局的文章图片
}
/**
 *  getLength
 *  将可编辑div中的表情和中文或者中文全角字符转换成英文便于计算字数
 */
publishContent.prototype.getLength = function(str) {
    // 检查是否汉字或者全角
    // 这里，一个表情代表着2个汉字
    return String(str).replace(/<img src=\"([^\"]+)\" title=\"([^\"]+)\" width=\"([^\"]+)\" height=\"([^\"]+)\">/g, 'aaaa').replace(/[^\x00-\xff]/g, 'aa').length;
};
/**
 * 用于改变右上角的字数提示
 */
publishContent.prototype.toChange = function() {
    var self = this;
    // 判断当前编辑框的字符个数，按照中文来计算
    var num = Math.ceil(self.getLength($('#J_publicTextarea').html()) / 2);

    // 判断右上角的字数提示是否存在，如果不存在，则直接返回
    var _$span = $('#J_content_titletxt span');
    if (_$span.length < 1) {
        return;
    }
    // 如果字符个数小于等于140的话，
    if (num <= 140) {
        // 则进行计算
        _$span.html(140 - num);
        _$span.css('color', '');
    } else {
        _$span.html(num - 140);
        _$span.css('color', 'red');
    }
    // 如果编辑框中的内容大于140个汉子并且没有输入任何内容，则给发布按钮移除样式
    if ($('#J_publicTextarea').html() == '' || num > 140) {
        // 说明没有上传图片
        if ($('#J_publishPic').length > 0) {
            $('#J_publicBtn').removeClass('ife_publicBtnValue');
        }
    } else {
        // 否则的话，就增加可显示样式
        $('#J_publicBtn').addClass('ife_publicBtnValue');
    }
};
/**
 * 初始化
 */
publishContent.prototype.initTextArea = function() {
    var self = this;
    // 当编辑框得到焦点的时候，则显示右上角的文字提示
    $('#J_publicTextarea').focus(function() {
        if (self.flag) {
            $('#J_content_titletxt').css('top', '14px');
            $('#J_content_titletxt').html('还可以输入<span>140</span>字');
            self.flag = false;
        }
    });
    // 当失去焦点的时候，如果编辑框中已经有文字了，就还是显示右上角的问题提示，如果没有输入任何内容，则就会显示iFE社交平台
    $('#J_publicTextarea').blur(function() {
        if ($('#J_publicTextarea').html() == '') {
            $('#J_content_titletxt').css('top', '22px');
            $('#J_content_titletxt').html('iFE社交平台');
            self.flag = true;
        }
    });
    // 当按下键盘时，则调用change方法
    $('#J_publicTextarea').keyup(function() {
        self.toChange();
    });
};

/**
 * 用于处理发布按钮的逻辑
 */
publishContent.prototype.publicBtn = function() {
    var self = this;
    $('#J_publicBtn').click(function() {
        // 如果编辑框没有这个样式，则会进行动画显示
        if (!$(this).hasClass('ife_publicBtnValue')) {
            clearInterval(self.timer);
            self.timer = setInterval(function() {
                if (self.iNum == 5) {
                    clearInterval(self.timer);
                    self.iNum = 0;
                } else {
                    self.iNum++;
                }

                if (self.iNum % 2) {
                    $('#J_publicTextarea').css('background', 'rgba(255, 144, 144, 0.5)');
                } else {
                    $('#J_publicTextarea').css('background', '');
                }
            }, 100);
            // 否则的话，将会进行文章的发表，这里将进行ajax发表
        } else {
            // 发布完成后，需要删除编辑框的内容，而且要恢复原来文件上传的内容
            // src属性
            // $('#J_fileUploadPic img').attr('src');
            // 文本内容
            var content = $('#J_publicTextarea').html()
            var fd = new FormData();
            var articleData = null;
            fd.append('content', content);
            if (self.articlePic) {
                fd.append('pic', self.articlePic);
            }
            $.ajax({
                url: '/article/post',
                type: 'POST',
                data: fd,
                processData: false,
                contentType: false,
                beforeSend: function(xhr) {},
                success: function(data) {
                    window.printMsg('success', data.msg, true);
                    articleData = data;
                    articleData.createAt = new Date(articleData.createAt);
                    delete articleData.msg;
                    var imgStr = '';
                    var ife_article_main = '<div class="ife_article_main" style="margin-bottom:20px;">';
                    if (articleData.picURL != '') {
                        imgStr = '<div class="ife_article_picCon"><img src="' + articleData.picURL + '" alt="文章图片" class="ife_article_pic"></div>';
                        ife_article_main = '<div class="ife_article_main">';
                    }
                    var str = '<div class="ife_article">\
                        <div class="ife_article_box clearfix"><a href="javascript:void(0);" class="ife_article_close">&times;</a><img src="' + articleData.avatar + '" alt="用户头像" width="50" height="50" class="ife_article_avatar">\
                          <div class="ife_article_content">\
                            '+ife_article_main+'\
                              <h2 class="ife_article_username" data-userid="' + articleData.userid + '">' + articleData.username + '</h2>\
                              <h3 class="ife_article_publishTime"> <a href="javascript:void(0);"><span>' + moment(articleData.createAt).fromNow() + '</span>发布</a></h3>\
                              <p class="ife_article_txt">' + articleData.content + '</p>\
                              '+imgStr+'\
                            </div>\
                            <div class="ife_article_info clearfix"><span class="ife_article_time">' + moment(articleData.createAt).calendar() + '</span><a href="javascript:void(0);" class="ife_article_praise">赞</a></div>\
                            <div total="4" class="ife_article_praises_total">4个人觉得很赞</div>\
                            <div class="ife_article_text_box">\
                              <div class="ife_comment_content_publish">\
                                <div class="ife_comment_content_hiddenInput">\
                                  <div title="评论输入框" contenteditable="true" class="ife_comment_content_ta"><span>我也说一句</span></div>\
                                </div>\
                                <div style="display:none;" class="ife_comment_content_inputbox">\
                                  <div class="ife_comment_content_input">\
                                    <div title="评论输入框" contenteditable="true" class="ife_comment_content_ta"></div>\
                                  </div>\
                                  <div class="ife_comment_content_publish_footer clearfix"><a href="javascript:void(0);"><img src="/images/edit_avatar.png">&nbsp;&nbsp;表情</a><a href="javascript:void(0);" class="ife_comment_publicBtn">发表</a></div>\
                                </div>\
                              </div>\
                            </div>\
                          </div>\
                        </div>\
                      </div>';
                    $('.ife_content_publish').after(str);
                    $('.ife_article').eq(0).addClass("animated bounceIn");
                    // 发表完成后，删除编辑框的内容，并且回复原来的文件上传
                    $('#J_publicTextarea').html('');
                    var fileStr = '<div class="ife_fileUploadControl clearfix">\
                                       <p class="pull-left">未上传图片</p><a id="J_fileUploadServer" href="javascript:void(0);" class="pull-right">上传</a>\
                                       </div>\
                                       <div id="J_fileUploadPic" class="ife_fileUploadPic"><img src="" style="display:none;"></div>\
                                       <input id="J_publishPic" type="file" name="publishPic" style="display:none;">\
                                   </div>';
                    $('.ife_fileUploadTooltip .panel-body').html(fileStr);
                    // 清空files中的内容
                    self.articlePic = null;
                    // 将发布按钮设置为灰色
                    $('#J_publicBtn').removeClass('ife_publicBtnValue');
                },
                error: function(obj) {
                    window.printMsg('error', JSON.parse(obj.responseText).msg, true);
                }
            });
        }
    });
};

/**
 * 用于处理表情按钮的逻辑
 */
publishContent.prototype.faceBtn = function() {
    $('#J_content_faceicon').click(function() {
        var _$elem = $('.ife_face_con');
        var flag = _$elem.is(':hidden');
        if (flag) {
            _$elem.show(500);
        } else {
            _$elem.hide(500);
        }
    });

    $(document).click(function(e) {
        if ($(e.target).closest('.ife_face_con').length != 1 && $(e.target).closest('#J_content_faceicon').length != 1) {
            $('.ife_face_con').hide(500);
        }
    });
};
/**
 * 上传图片的逻辑
 */
publishContent.prototype.uploadPicBtn = function() {
    $('#J_content_fileUpload').click(function() {
        var _$elem = $('.ife_fileUploadTooltip');
        var flag = _$elem.is(':hidden');
        if (flag) {
            _$elem.show(500);
        } else {
            _$elem.hide(500);
        }
    });

    $(document).click(function(e) {
        if ($(e.target).closest('.ife_fileUploadTooltip').length != 1 && $(e.target).closest('#J_content_fileUpload').length != 1) {
            $('.ife_fileUploadTooltip').hide(500);
        }
    });
    $('#J_closePublishPic').click(function() {
        $('.ife_fileUploadTooltip').hide(500);
    });
};
/**
 * 上传图片的逻辑
 */
publishContent.prototype.uploadPic = function() {
    var self = this;
    $('.ife_fileUploadTooltip').on('change', '#J_publishPic', function (e) {
        var pic = e.target.files[0];
        var imgRep = /^image\/(jpeg|jpg|gif|png|bmp)$/i;
        if (pic && imgRep.test(pic.type)) {
            self.articlePic = pic;
            var fr = new FileReader();
            fr.readAsDataURL(pic);
            fr.onload = function() {
                $('#J_fileUploadPic img').attr('src', this.result);
                $('#J_fileUploadPic img').show();
                window.printMsg('success', '图片本地预览成功', true);
                $('.ife_fileUploadControl p').html('已上传图片');
                $('#J_publishPic').remove();
                $('#J_publicBtn').addClass('ife_publicBtnValue');
            };
        } else {
            console.log('haha');
            if (pic) {
                window.printMsg('warning', '请上传图片格式', true);
            }
        }
    });
    $('.ife_fileUploadTooltip').on('click', '#J_fileUploadServer', function () {
        // J_publishPic就是隐藏的文件上传框
        if ($('#J_publishPic').length > 0) {
            $('#J_publishPic').click();
        }
    });

};

/**
 * 添加表情到div中
 */
publishContent.prototype.appendFace = function() {
    var self = this;
    $("#J_faceIcon").find("li").click(function() {
        var img = $(this).find("img").clone();
        $("#J_publicTextarea").append(img);
        $('#J_publicTextarea').focus();
        self.toChange();
    });
};

var pc = new publishContent();
pc.initTextArea();
pc.publicBtn();
pc.faceBtn();
pc.uploadPicBtn();
pc.uploadPic();
pc.appendFace();
