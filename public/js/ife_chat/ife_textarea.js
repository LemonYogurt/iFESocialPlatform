/**
 *  包含文章的发表和点赞
 */

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
    // 如果编辑框中的内容大于140个汉子并且没有输入任何内容，则给发布按钮移除样式
    if ($('#J_publicTextarea').html() == '' || num > 140) {
        $('#J_publicBtn').removeClass('ife_publicBtnValue');
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
    // 当按下键盘时，则调用change方法
    $('#J_publicTextarea').keyup(function() {
        self.toChange();
    });
};

/**
 * 用于处理发布按钮的逻辑
 */
publishContent.prototype.publicBtn = function(chatSocket) {
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
            var content = $('#J_publicTextarea').html()
            $('#J_publicTextarea').html('');
            var userid = $('#J_publicBtn').data('userid');
            chatSocket.emit('createMessage', {content: content, userid: userid});
            // 将发布按钮设置为灰色
            $('#J_publicBtn').removeClass('ife_publicBtnValue');
            $('#J_publicTextarea').blur();
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

publishContent.prototype.findUser = function () {
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

publishContent.prototype.enterBreak = function () {
    var ctrlDown = false;
    $('#J_publicTextarea').bind('keydown', function (e) {
        /**
         * ctrl键的keyCode是17
         */
        if (e.which == 17) {
            ctrlDown = true;
            setTimeout(function () {
                ctrlDown = false;
            }, 1000);
        }
        /**
         * enter键是13
         */
        if (e.which == 13) {
            if (ctrlDown) {
                $('#J_publicTextarea').html($('#J_publicTextarea').html() + '<div>&nbsp;</div>');
            } else {
                $('#J_publicBtn').click();
            }
        }
    });
};

var pc = new publishContent();
pc.initTextArea();
pc.publicBtn(chatSocket);
pc.faceBtn();
pc.appendFace();
pc.findUser();
pc.enterBreak();