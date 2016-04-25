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
                success: function(data) {
                    window.printMsg('success', data.msg, true);
                    articleData = data;
                    articleData.createAt = new Date(articleData.createAt);
                    delete articleData.msg;
                    console.log(articleData);
                    var imgStr = '';
                    var ife_article_main = '<div class="ife_article_main" style="margin-bottom:20px;">';
                    if (articleData.picURL != '') {
                        imgStr = '<div class="ife_article_picCon"><img src="' + articleData.picURL + '" alt="文章图片" class="ife_article_pic"></div>';
                        ife_article_main = '<div class="ife_article_main">';
                    }
                    var str = '<div class="ife_article">\
                                <div class="ife_article_box clearfix"><a href="javascript:void(0);" class="ife_article_close" data-articleid="'+articleData.articleid+'" data-userid="'+articleData.userid+'">&times;</a><img src="' + articleData.avatar + '" alt="用户头像" width="50" height="50" class="ife_article_avatar">\
                                  <div class="ife_article_content">\
                                    ' + ife_article_main + '\
                                      <h2 class="ife_article_username" data-userid="' + articleData.userid + '">' + articleData.username + '</h2>\
                                      <h3 class="ife_article_publishTime"> <a href="javascript:void(0);"><span>' + moment(articleData.createAt).fromNow() + '</span>发布</a></h3>\
                                      <p class="ife_article_txt">' + articleData.content + '</p>\
                                      ' + imgStr + '\
                                    </div>\
                                    <div class="ife_article_info clearfix"><span class="ife_article_time">发表于&nbsp;' + moment(articleData.createAt).calendar() + '</span><a href="javascript:void(0);" class="ife_article_praise" data-articleid="' + articleData.articleid + '" data-userid="' + articleData.userid + '">赞</a></div>\
                                    <div total="0" class="ife_article_praises_total" style="display:none;"></div>\
                                    <div class="ife_article_text_box">\
                                      <div class="ife_comment_content_publish">\
                                        <div class="ife_comment_content_hiddenInput">\
                                          <div title="评论输入框" contenteditable="true" class="ife_comment_content_ta"><span>我也说一句</span></div>\
                                        </div>\
                                        <div style="display:none;" class="ife_comment_content_inputbox">\
                                          <div class="ife_comment_content_input">\
                                            <div title="评论输入框" contenteditable="true" class="ife_comment_content_ta"></div>\
                                          </div>\
                                          <div class="ife_comment_content_publish_footer clearfix"><a class="J_comment_face_icon" href="javascript:void(0);"><img src="/images/edit_avatar.png">&nbsp;&nbsp;表情</a><div class="ife_comment_face_con"><ul class="J_comment_faceIcon clearfix"><li><img src="/images/face/zz2_thumb.gif" title="[织]" width="22" height="22"></li><li><img src="/images/face/horse2_thumb.gif" title="[神马]" width="22" height="22"></li><li><img src="/images/face/fuyun_thumb.gif" title="[浮云]" width="22" height="22"></li><li><img src="/images/face/geili_thumb.gif" title="[给力]" width="22" height="22"></li><li><img src="/images/face/wg_thumb.gif" title="[围观]" width="22" height="22"></li><li><img src="/images/face/vw_thumb.gif" title="[威武]" width="22" height="22"></li><li><img src="/images/face/panda_thumb.gif" title="[熊猫]" width="22" height="22"></li><li><img src="/images/face/rabbit_thumb.gif" title="[兔子]" width="22" height="22"></li><li><img src="/images/face/otm_thumb.gif" title="[奥特曼]" width="22" height="22"></li><li><img src="/images/face/j_thumb.gif" title="[囧]" width="22" height="22"></li><li><img src="/images/face/hufen_thumb.gif" title="[互粉]" width="22" height="22"></li><li><img src="/images/face/liwu_thumb.gif" title="[礼物]" width="22" height="22"></li><li><img src="/images/face/smilea_thumb.gif" title="[呵呵]" width="22" height="22"></li><li><img src="/images/face/tootha_thumb.gif" title="[嘻嘻]" width="22" height="22"></li><li><img src="/images/face/laugh.gif" title="[哈哈]" width="22" height="22"></li><li><img src="/images/face/tza_thumb.gif" title="[可爱]" width="22" height="22"></li><li><img src="/images/face/kl_thumb.gif" title="[可怜]" width="22" height="22"></li><li><img src="/images/face/kbsa_thumb.gif" title="[挖鼻屎]" width="22" height="22"></li><li><img src="/images/face/cj_thumb.gif" title="[吃惊]" width="22" height="22"></li><li><img src="/images/face/shamea_thumb.gif" title="[害羞]" width="22" height="22"></li><li><img src="/images/face/zy_thumb.gif" title="[挤眼]" width="22" height="22"></li><li><img src="/images/face/bz_thumb.gif" title="[闭嘴]" width="22" height="22"></li><li><img src="/images/face/bs2_thumb.gif" title="[鄙视]" width="22" height="22"></li><li><img src="/images/face/lovea_thumb.gif" title="[爱你]" width="22" height="22"></li><li><img src="/images/face/sada_thumb.gif" title="[泪]" width="22" height="22"></li><li><img src="/images/face/heia_thumb.gif" title="[偷笑]" width="22" height="22"></li><li><img src="/images/face/qq_thumb.gif" title="[亲亲]" width="22" height="22"></li><li><img src="/images/face/sb_thumb.gif" title="[生病]" width="22" height="22"></li><li><img src="/images/face/mb_thumb.gif" title="[太开心]" width="22" height="22"></li><li><img src="/images/face/ldln_thumb.gif" title="[懒得理你]" width="22" height="22"></li><li><img src="/images/face/yhh_thumb.gif" title="[右哼哼]" width="22" height="22"></li><li><img src="/images/face/zhh_thumb.gif" title="[左哼哼]" width="22" height="22"></li><li><img src="/images/face/x_thumb.gif" title="[嘘]" width="22" height="22"></li><li><img src="/images/face/cry.gif" title="[衰]" width="22" height="22"></li><li><img src="/images/face/wq_thumb.gif" title="[委屈]" width="22" height="22"></li><li><img src="/images/face/t_thumb.gif" title="[吐]" width="22" height="22"></li><li><img src="/images/face/k_thumb.gif" title="[打哈气]" width="22" height="22"></li><li><img src="/images/face/bba_thumb.gif" title="[抱抱]" width="22" height="22"></li><li><img src="/images/face/angrya_thumb.gif" title="[怒]" width="22" height="22"></li><li><img src="/images/face/yw_thumb.gif" title="[疑问]" width="22" height="22"></li><li><img src="/images/face/cza_thumb.gif" title="[馋嘴]" width="22" height="22"></li><li><img src="/images/face/88_thumb.gif" title="[拜拜]" width="22" height="22"></li><li><img src="/images/face/sk_thumb.gif" title="[思考]" width="22" height="22"></li><li><img src="/images/face/sweata_thumb.gif" title="[汗]" width="22" height="22"></li><li><img src="/images/face/sleepya_thumb.gif" title="[困]" width="22" height="22"></li><li><img src="/images/face/sleepa_thumb.gif" title="[睡觉]" width="22" height="22"></li><li><img src="/images/face/money_thumb.gif" title="[钱]" width="22" height="22"></li><li><img src="/images/face/sw_thumb.gif" title="[失望]" width="22" height="22"></li><li><img src="/images/face/cool_thumb.gif" title="[酷]" width="22" height="22"></li><li><img src="/images/face/hsa_thumb.gif" title="[花心]" width="22" height="22"></li><li><img src="/images/face/hatea_thumb.gif" title="[哼]" width="22" height="22"></li><li><img src="/images/face/gza_thumb.gif" title="[鼓掌]" width="22" height="22"></li><li><img src="/images/face/dizzya_thumb.gif" title="[晕]" width="22" height="22"></li><li><img src="/images/face/bs_thumb.gif" title="[悲伤]" width="22" height="22"></li><li><img src="/images/face/crazya_thumb.gif" title="[抓狂]" width="22" height="22"></li><li><img src="/images/face/h_thumb.gif" title="[黑线]" width="22" height="22"></li><li><img src="/images/face/yx_thumb.gif" title="[阴险]" width="22" height="22"></li><li><img src="/images/face/nm_thumb.gif" title="[怒骂]" width="22" height="22"></li><li><img src="/images/face/hearta_thumb.gif" title="[心]" width="22" height="22"></li><li><img src="/images/face/unheart.gif" title="[伤心]" width="22" height="22"></li><li><img src="/images/face/pig.gif" title="[猪头]" width="22" height="22"></li><li><img src="/images/face/ok_thumb.gif" title="[ok]" width="22" height="22"></li><li><img src="/images/face/ye_thumb.gif" title="[耶]" width="22" height="22"></li><li><img src="/images/face/good_thumb.gif" title="[good]" width="22" height="22"></li><li><img src="/images/face/no_thumb.gif" title="[不要]" width="22" height="22"></li><li><img src="/images/face/z2_thumb.gif" title="[赞]" width="22" height="22"></li><li><img src="/images/face/come_thumb.gif" title="[来]" width="22" height="22"></li><li><img src="/images/face/sad_thumb.gif" title="[弱]" width="22" height="22"></li><li><img src="/images/face/lazu_thumb.gif" title="[蜡烛]" width="22" height="22"></li><li><img src="/images/face/clock_thumb.gif" title="[钟]" width="22" height="22"></li><li><img src="/images/face/cake.gif" title="[蛋糕]" width="22" height="22"></li><li><img src="/images/face/m_thumb.gif" title="[话筒]" width="22" height="22"></li><li><img src="/images/face/weijin_thumb.gif" title="[围脖]" width="22" height="22"></li><li><img src="/images/face/lxhzhuanfa_thumb.gif" title="[转发]" width="22" height="22"></li><li><img src="/images/face/lxhluguo_thumb.gif" title="[路过这儿]" width="22" height="22"></li><li><img src="/images/face/bofubianlian_thumb.gif" title="[bofu变脸]" width="22" height="22"></li><li><img src="/images/face/gbzkun_thumb.gif" title="[gbz困]" width="22" height="22"></li><li><img src="/images/face/boboshengmenqi_thumb.gif" title="[生闷气]" width="22" height="22"></li><li><img src="/images/face/chn_buyaoya_thumb.gif" title="[不要啊]" width="22" height="22"></li><li><img src="/images/face/daxiongleibenxiong_thumb.gif" title="[dx泪奔]" width="22" height="22"></li><li><img src="/images/face/cat_yunqizhong_thumb.gif" title="[运气中]" width="22" height="22"></li><li><img src="/images/face/youqian_thumb.gif" title="[有钱]" width="22" height="22"></li><li><img src="/images/face/cf_thumb.gif" title="[冲锋]" width="22" height="22"></li><li><img src="/images/face/camera_thumb.gif" title="[照相机]" width="22" height="22"></li></ul></div><a href="javascript:void(0);" class="ife_comment_publishBtn" data-userid="'+articleData.userid+'" data-articleid="'+articleData.articleid+'">发表</a></div>\
                                        </div>\
                                      </div>\
                                    </div>\
                                  </div>\
                                </div>\
                              </div>';
                    $('.ife_content_publish').after(str);
                    $('.ife_article').eq(0).addClass('animated bounceIn');
                    setTimeout(function () {
                        $('.ife_article').eq(0).removeClass('animated bounceIn');
                    }, 1000);
                    $('#J_currentUserArticleNum').html(parseInt($('#J_currentUserArticleNum').html()) + 1);
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
                    $('#J_publicTextarea').blur();
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
    $('.ife_fileUploadTooltip').on('change', '#J_publishPic', function(e) {
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
    $('.ife_fileUploadTooltip').on('click', '#J_fileUploadServer', function() {
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

/**
 *  实现点赞功能
 */
publishContent.prototype.articlePraise = function() {
    $('.ife_weiboRightContentBody').on('click', '.ife_article_praise', function(e) {
        // 得到了userid
        // $(e.target).data('userid');
        // 获得了对应的显示赞的div
        // $(e.target).parent().next()

        // 获得当前赞的数量：
        // console.log(parseInt($(e.target).parent().next().attr('total')));
        // 获取当前div显示的内容
        // console.log($(e.target).parent().next().html());
        var $currentEle = $(e.target);
        var txt = $currentEle.html();
        // 要知道点赞的用户，需要点赞的文章，当前用户只要从session中查询就行了
        var from = $currentEle.data('userid');
        var articleid = $currentEle.data('articleid');
        // 显示赞的div
        var $displayPraiseEle = $(e.target).parent().next();
        // 得到赞的数量
        var oldTotal = parseInt($displayPraiseEle.attr('total'));
        console.log(oldTotal);
        // 用于计算赞的数量
        var newTotal;

        if (txt === '赞') {
            $.ajax({
                url: '/article/addPraise',
                type: 'POST',
                data: {articleid: articleid, from: from},
                success: function(data) {
                    window.printMsg('success', data.msg, true);
                    newTotal = oldTotal + 1;
                    $displayPraiseEle.html((newTotal === 1) ? '我觉得很赞' : '我和' + oldTotal + '个人觉得很赞');
                    $currentEle.html('取消赞');
                    $displayPraiseEle.attr('total', newTotal);
                    $displayPraiseEle.css('display', (newTotal === 0) ? 'none' : 'block');
                },
                error: function(obj) {
                    window.printMsg('error', JSON.parse(obj.responseText).msg, true);
                }
            });
        } else {
            $.ajax({
                url: '/article/cancelPraise',
                type: 'POST',
                data: {articleid: articleid, from: from},
                success: function (data) {
                    window.printMsg('success', data.msg, true);
                    newTotal = oldTotal - 1;
                    $displayPraiseEle.html((newTotal === 0) ? '' : newTotal + '个人觉得很赞');
                    $currentEle.html('赞');
                    $displayPraiseEle.attr('total', newTotal);
                    $displayPraiseEle.css('display', (newTotal === 0) ? 'none' : 'block');
                },
                error: function(obj) {
                    window.printMsg('error', JSON.parse(obj.responseText).msg, true);
                }
            });
        }
    });
};

publishContent.prototype.deleteArticle = function () {
    $('.ife_weiboRightContentBody').on('click', '.ife_article_close', function() {
        var $self = $(this);
        var articleid = $self.data('articleid');
        var userid = $self.data('userid');
        var $parent = $self.parent().parent();
        $.confirm({
            autoClose: 'cancel|6000',
            confirm: function(){
                $.ajax({
                    url: '/article/del',
                    type: 'DELETE',
                    data: {userid: userid, articleid: articleid},
                    success: function (data) {
                        window.printMsg('success', data.msg, true);
                        $parent.addClass('animated bounceOut');
                        setTimeout(function () {
                            $parent.hide(500, function () {
                                $parent.remove();    
                            });
                        }, 1000);
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

/*
$.confirm({
                //autoClose: 'cancel|6000',
                confirm: function(){
                   
                },
                cancel: function(){
                  
                }
            });
*/

var pc = new publishContent();
pc.initTextArea();
pc.publicBtn();
pc.faceBtn();
pc.uploadPicBtn();
pc.uploadPic();
pc.appendFace();
pc.articlePraise();
pc.deleteArticle();