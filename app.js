var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var mongoose = require('mongoose');
var async = require('async');
var moment = require('moment');
var redisClient = require('./app/config').redisClient;
var mongodbClient = require('./app/config').mongodbClient;
var index = require('./app/router');
var user = require('./app/router/user');
var article = require('./app/router/article');
var comment = require('./app/router/comment');
var home = require('./app/router/home');
var find = require('./app/router/find');

var app = express();
var port = process.env.PORT || 3000;

app.set('views', path.join(__dirname, './app/views'));
app.set('view engine', 'jade');
// 线上生产环境使用设置production
// 线下默认环境是development
app.set('env', 'development');
app.set('port', port);

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
var sessionStore = new RedisStore({
	host:'127.0.0.1',
	port: 6379,
	db: 1
});
app.use(session({
	//这里的name指的是是cookie的name，默认cookie的name是：connect.sid
	name: 'connect.sid',   
	cookie: {maxAge: null},  //{maxAge: 80000}：80s后session和相应的cookie失效过期
	secret: 'iFE',
	resave: false,
	saveUninitialized: true,
	store: sessionStore
}));

app.use('/', index);
app.use('/user', user);
app.use('/article', article);
app.use('/comment', comment);
app.use('/home', home);
app.use('/find', find);

if ('development' === app.get('env')) {
	app.set('showStackError', true);
	/**
	 * 设置jade模板渲染格式化
	 */
	app.locals.pretty = true;
	mongoose.set('debug', true);
}
// 引入语言
moment.locale('zh-cn');
app.locals.moment = moment;
var server = app.listen(port, function () {
	console.log('Listening ', port, ' success...');
});

/* = */

var signedCookieParser = cookieParser('iFE');
var io = require('socket.io').listen(server);

io.set('authorization', function (req, next) {
	signedCookieParser(req, {}, function (err) {
		sessionStore.get(req.signedCookies['connect.sid'], function (err, session) {
			if (err) {
				next(err);
			} else {
				if (session && session.user) {
					console.log('进入了session');
					req.session = session;
					next(null, true);
				} else {
					next('未登录');
				}
			}
		});
	});
});

// 用于存放发送的消息
var messages = [];
/*
	content
	username
	userid
	avatar
	createAt
*/
// 用于存放在线的人数
var users = [];
// 系统消息的信息
var SYSTEM = {
	username: 'i女神',
	// 默认头像
	avatar: '/images/ife_userDefaultAvatar_little.gif'
};
async.series({
	getMessages: function (done) {
		redisClient.get('ife_chat:messages', function (err, result) {
			if (err) {
				console.log(err);
				done(err);
			} else {
				if (result) {
					messages = JSON.parse(result);
				} else {
					messages = [];
				}
				console.log(messages);
				done(null);
			}
		});
	},
	socketInit: function (done) {
		io.sockets.on('connection', function (socket) {
			console.log('进入了');
			/**
			 * 由于前面经过了中间件的处理，所以能运行到这里说明用户已经是登录过的
			 */
			var user = socket.request.session.user;
			//users.push(user);
			// 这是为了统计在线人数
			if (indexOf(users, user, '_id') < 0) {
				users.push(user);
			}

			// socket广播消息，新用户进入了聊天室
			socket.broadcast.emit('message.add', {
				content: SYSTEM.username + '(系统消息):   ' + user.username + '进入了聊天室',
				username: SYSTEM.username + '(系统)',
				userid: '',
				avatar: SYSTEM.avatar,
				createAt: new Date()
			});
			/**
			 * connected是自定义事件
			 */
			socket.emit('connected');

			// 每当用户进入聊天室的时候，都将会拉取所有的聊天记录
			// 当其中一个用户拉取信息成功之后，就会向其他的用户发送信息了
			socket.on('getAllInfos', function () {
				socket.emit('allInfos', {messages: messages, users: users});
				/**
				 * 当登录完成后，更新在线用户
				 * 这里没有使用io.emit的原因是，在发送allMessages事件的时候，
				 * 已经将当前用户存放到了users数组中了，如果当前用户不必得到自己上线的通知
				 * 而其它用户需要得到通知
				 */
				socket.broadcast.emit('user.add', user);
			});
			// content userid
			socket.on('createMessage', function (message) {
				message.username = user.username;
				message.avatar = user.avatar;
				message.createAt = new Date();
				messages.push(message);
				redisClient.set('ife_chat:messages', JSON.stringify(messages), function (err, result) {
					if (err) {
						console.log(err);
					}
				});
				/**
				 * push之后，要通知所有人更新消息列表
				 */
				io.emit('message.add', message);
			});

			/**
			 * 用户退出的处理
			 */
			socket.on('disconnect', function () {
				/**
				 * 注意：这里使用数组的indexOf方法是无法判断对象的
				 */
				var index = indexOf(users, user, '_id');
				//users.splice(index, 1);
				if (indexOf(users, user, '_id') >= 0) {
					users.splice(index, 1);
				}
				
				socket.broadcast.emit('user.logout', user);
				socket.broadcast.emit('message.add', {
					content: SYSTEM.username + '(系统消息)' + user.username + '退出了聊天室',
					username: SYSTEM.username + '(系统)',
					userid: '',
					avatar: SYSTEM.avatar,
					createAt: new Date()
				});
			});

			// socket.on('pleaseClose', function () {
			// 	socket.disconnect();
			// });
		});
		done(null);
	}
}, function (err, result) {
	if (err) {
		console.log(err);
	}
});



function indexOf(arr, obj, attr) {
	for (var i = 0; i < arr.length; i++) {
		if (obj[attr] == arr[i][attr]) {
			return i;
		}
	}
	return -1;
}