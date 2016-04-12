var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var mongoose = require('mongoose');

var mongodb = require('./app/config').mongodb;
var index = require('./app/router');
var user = require('./app/router/user');

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
app.use(session({
	//这里的name指的是是cookie的name，默认cookie的name是：connect.sid
	name: 'connect.sid',   
	cookie: {maxAge: null},  //{maxAge: 80000}：80s后session和相应的cookie失效过期
	secret: 'iFE',
	resave: false,
	saveUninitialized: true
}));

app.use('/', index);
app.use('/user', user);

if ('development' === app.get('env')) {
	app.set('showStackError', true);
	/**
	 * 设置jade模板渲染格式化
	 */
	app.locals.pretty = true;
	mongoose.set('debug', true);
}
app.listen(port, function () {
	console.log('Listening ', port, ' success...');
});