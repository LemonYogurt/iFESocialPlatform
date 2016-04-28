function ChatSocket() {
	this.socket = io.connect(window.location.protocol + '//' + window.location.host);
	this.infos = null;
	this.messages = null;
	this.users = null;
}

// 连接websocket
ChatSocket.prototype.connect = function () {
	this.socket = io.connect(window.location.protocol + '//' + window.location.host);
};

// 监听事件
ChatSocket.prototype.on = function (eventName, callback) {
	/**
	 * 在绑定事件之前，把之前绑定的全部移除掉，这样就能确保绑定的就只有一份了
	 * 否则在进入大厅之后，再跳转到其它路由，再跳转回大厅，发送一段文字就会出现多份
	 */
	var self = this;
	this.socket.removeAllListeners(eventName);
	this.socket.on(eventName, function () {
		var args = arguments
		callback.apply(self.socket, args);
	});
};

// 发射事件
ChatSocket.prototype.emit = function (eventName, data) {
	this.socket.emit(eventName, data);
};

ChatSocket.prototype.indexOf = function (arr, obj, attr) {
	for (var i = 0; i < arr.length; i++) {
		if (obj[attr] == arr[i][attr]) {
			return i;
		}
	}
	return -1;
};

ChatSocket.prototype.generateMessage = function (message) {
	var link = 'javascript:void(0);'
	if (message.userid) {
		link = '/home/detail/'+message.userid+'/92a2b5cb9c6906035c2864fa225e1940';
	}
	var username = $('#J_ifeNavUserName').data('username');
	var showDire = message.username == username ? 'ife_chatpublishcontentshowright' : 'ife_chatpublishcontent';
	var str = '<div class="'+showDire+' clearfix">\
                    <div class="ife_chatpublishavatar">\
                        <a href="'+link+'" target="_blank">\
                            <img title="'+message.username+'" src="'+message.avatar+'" width="50" height="50">\
                        </a>\
                    </div>\
                    <div class="ife_chatpushlishtext">\
                        <i></i>\
                        <em></em>\
                        <span>'+message.content+'</span>\
                    </div>\
                </div>';
    $('.ife_chatpublishbox').append(str);
};

ChatSocket.prototype.generateUser = function (user) {
	var username = $('#J_ifeNavUserName').data('username');
	var name = username == user.username ? '我': user.username;
	var str = '<li data-userid="'+user._id+'">\
				<img src="'+user.avatar+'" width="30" height="30" />\
                <p>\
                	<a href="/home/detail/'+user.userid+'/92a2b5cb9c6906035c2864fa225e1940" target="_blank">'+user.username+'</a>\
            	</p>\
              </li>';
	$('.ife_contactsbox ul').append(str);
};

ChatSocket.prototype.scrollBottom = function (time) {
    time = time || 800;
    var element = $('.ife_chatpublishbox');
    element.animate({
        scrollTop: element.prop('scrollHeight')
    }, time);
};

var chatSocket = new ChatSocket();
// 创建连接
// chatSocket.connect();
// 
// connected是自定义事件
chatSocket.on('connected', function () {
    // 当连接成功后，服务器端会发送一个connected事件，然后客户端监听之后，
    // 发送getAllMessages事件得到所有的信息
    chatSocket.emit('getAllInfos');
});
// 这里会接收所有的信息
chatSocket.on('allInfos', function (infos) {
    chatSocket.infos = infos;
    chatSocket.messages = infos.messages;
    chatSocket.users = infos.users;

    for (var i = 0; i < chatSocket.messages.length; i++) {
        chatSocket.generateMessage(chatSocket.messages[i]);
    }
    for (i = 0; i < chatSocket.users.length; i++) {
        chatSocket.generateUser(chatSocket.users[i]);
    }
    chatSocket.scrollBottom(800);
});
// 得到信息后，提交到页面上
chatSocket.on('message.add', function (message) {
    chatSocket.messages.push(message);
    chatSocket.generateMessage(message);
    chatSocket.scrollBottom(800);
});

chatSocket.on('user.add', function (user) {
    chatSocket.users.push(user);
    chatSocket.generateUser(user);
});

chatSocket.on('user.logout', function (user) {
    var userid = user._id;
    var index = chatSocket.indexOf(chatSocket.users, user, '_id');
    if (index != -1) {
        chatSocket.users.splice(index, 1);
    }
    $('.ife_contactsbox ul').find('li').each(function (k, v) {
        if ($(v).data('userid') == userid) {
            $(v).remove();
        }
    });
});