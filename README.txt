User Router:
#头像上传：
set users:userid:*:avatarFlag true
set users:userid:*:avatar path
db.users.update({_id: *}, {$set: {avatar: path});

#取消关注：很第三方第三方第三方第三方第三方第三方第三方水电费水电费第三方的师傅水电费阿凡达爱疯adsl减肥乐山大佛了多少级发了就乐山大佛九点十分第三方是的但是但是反倒是第三方地方第三方
删除两个集合中的用户id
srem stars:userid:* userid
srem fans:userid:~* userid
查询文章的信息：
for
hgetall article:articleid:*
删除关注者的文章
for
lrem index:userid:* 1 articleid

#关注用户：
添加用户
sadd stars:userid:* userid
sadd fans:userid:~* userid
拉取关注者的文章（查询出所有的articleid）：
zrangebyscore fanspost:userid:~* 0 Date.now()
把文章发到首页文章链表中
lpush index:userid:* articleArr

#退出登录
删除session
delete req.session.user
重定向redirect首页

#登录用户：
从redis中查：
根据用户名查出userid
根据userid查出密码
get users:username:*:userid
get users:userid:*:password
如果查到了，并且密码匹配了，则查询出用户的其他相关信息：
get users:userid:*:avatar
get users:userid:*:createTime
get users:userid:*:avatarFlag
将用户的信息存到session中

如果redis中没有的话，则从mongo中查
db.users.findOne({username: username});
查询出之后，对密码进行比对，比对成功，将用户信息缓存到Redis中：
set users:userid:*:username username
set users:userid:*:password password
set users:userid:*:avatar avatar
set users:userid:*:avatarFlag avatarFlag
set users:userid:*:createTime createTime
set users:username:*:userid userid

#注册用户：
注册之前，查询用户是否已经存在
get users:username:*:userid userid
db.users.findOne({username: username});
如果mongo查到了，而Redis没查到，说明Redis没有进行缓存：
set users:userid:*:username username
set users:userid:*:password password
set users:userid:*:avatar avatar
set users:userid:*:avatarFlag avatarFlag
set users:userid:*:createTime createTime
set users:username:*:userid userid

如果都没有查到，则进行添加操作：
set users:userid:*:username username
set users:userid:*:password password
set users:userid:*:avatar '/images/defaultAvatar.png'
set users:userid:*:avatarFlag false
set users:userid:*:createTime new Date()
set users:username:*:userid userid

db.users.insert({
	_id: _id,
	username: username,
	password: hash,
	avatar: avatar,
	avatarFlag: avatarFlag,
	createTime: createTime
});

维护一个链表，用于保存最新注册的用户：
lpush latestreguserlink userid
只保留最新的25个用户
ltrim latestreguserlink 0 24

article Router：

#删除文章：
得到文章中的评论id：
hgetall article:articleid:*
{ 	content: '第三方',
	picURL: '',
	createAt: 'Thu Apr 21 2016 19:43:54 GMT+0800 (CST)',
	userid: '57161fbac9f38d924576f671',
	praise: '',
	commentsid: '5718bd1d42e2c86c4c57d231,5718bcfc42e2c86c4c57d22d'
	articleid: '',
	username: '',
	avatar: ''
}
del article:articleid:*
删除链表中保存的文章id：
lrange currentpost:userid:* 0 -1
lrem currentpost:userid:* 1 articleid
lrem global:article 1 articleid
删除评论：
hgetall comment:commentid:*
del comment:commentid:*

删除回复：
del replycomment:replycommentid:* scommentid

如果该文章在redis不存在，则从mongo中查询删除
db.articles.remove({_id: articleid});

减少当前用户文章的数量：
decr currentpostnum:userid:*

以上只是单纯的把文章给删除了，但是没有把其他地方保存的articleid删除

删除为粉丝维护的文章集合
查询出用户为粉丝维护的文章集合
zrangebyscore fanspost:userid:* 0 Date.now()
for
hgetall article:articleid:*
如果查询的结果为null，则进行删除
zrem fanspost:userid:* articleid

删除当前用户存放的文章链表
lrange currentpost:userid:* 0 -1
for
hgetall article:articleid:*
如果查询的结果为null，则进行删除
lrem currentpost:userid:* 1 articleid

#文章点赞
hget article:articleid:* praise
praise保存的是userid
hset article:articleid:* praise praise

#取消点赞：
hget article:articleid:* praise
praise保存的是userid
hset article:articleid:* praise praise

#发表文章
hmset article:articleid:* content * picURL * createAt * userid * praise * commentsid *
zadd fanspost:userid:* Date.now() articleid
判断当前为粉丝保存文章的集合是否超过了20
zcard fanspost:userid:*
zremrangebyrank fanspost:userid:* 0 0
保存到当前用户的文章链表中：
lpush currentpost:userid:* articleid
当前文章数加1
incr currentpostnum:userid:*
判断当前文章的链表是否超过了40
llen currentpost:userid:*
rpoplpush currentpost:userid:* global:article


index Router
得到侧边栏的数据：
scard stars:userid:*
scard fans:userid:*
get currentpostnum:userid:*
查询出关注的所有用户：
smembers stars:userid:*
查询出最新注册的用户：
latestreguserlink 0 -1
(根据用户id查询出用户信息)

开始拉取文章：
获取上次的拉取点：
get lastpullpoint:userid:*
根据拉取点获取文章列表：
for
zrangebyscore fanspost:userid:* lastPullPoint+1 Date.now()
拉取完成之后，重新设置拉取点
set lastpullpoint:userid:* Date.now()
在添加到index链表之前，清理一下index链表，也就是如果文章有null的，则表示已经删除过了，就从index链表中移除掉
lrange index:userid:* 0 -1
for
hgetall article:articleid:*
lrem index:userid:* 1 articleid
删除过后，就可以将拉取到的article保存到index链表中
lpush index:userid:* artilceArr
然后进行截取：
ltrim index:userid:* 0 59
之后，根据index中保存的文章id，获取全部文章的信息


home Router:
关注（自己）：
scard stars:userid:*
scard fans:userid:*
get currentpostnum:userid:*
smembers stars:userid:*

关注（其他）：
获取other的stars信息：
smembers stars:userid:*
得到other的stars信息：
得到self的stars信息：
smembers stars:userid:*
得到other用户的信息
求共同关注：
sinter stars:userid:* stars:userid:~*
得到这些用户的信息

find Router
获得侧边栏的数据：
scard stars:userid:*
scard fans:userid:*

ArticleSchema:
{ 	content: '第三方',
	picURL: '',
	createAt: 'Thu Apr 21 2016 19:43:54 GMT+0800 (CST)',
	userid: '57161fbac9f38d924576f671',
	praise: '',
	commentsid: '5718bd1d42e2c86c4c57d231,5718bcfc42e2c86c4c57d22d'
	articleid: '',
	username: '',
	avatar: ''
}
{
	articleid: '5718b49842e2c86c4c57d216',
	to: '57161fbac9f38d924576f671',
	toUsername: '',
	content: '水电费对方',
	praise: '',
	createAt: 'Thu Apr 21 2016 19:08:59 GMT+0800 (CST)',
	from: '57161fbac9f38d924576f671',
	fromUsername: '',
	reply: '5718b74a42e2c86c4c57d21b'
	fromavatar: '',
	commentid: ''
}

从Redis中获取到的数据
{
	articleid: '5719cfab9f65976c07df3c92',
    content: 'ssdfdsfd',
    picURL: '',
    createAt: 'Fri Apr 22 2016 15:15:55 GMT+0800 (CST)',
    userid: '57161e84c9f38d924576f66e',
    username: '百里登风',
    avatar: '/images/defaultAvatar.png',
    praise: '57161e84c9f38d924576f66e',
    commentsid: '5719cfb19f65976c07df3c93',
    comments: [{
        to: '57161e84c9f38d924576f66e',
        from: '57161e84c9f38d924576f66e',
        content: 'ssdfdsfd',
        praise: '57161e84c9f38d924576f66e,57161e84c9f38d924576f66e',
        articleid: '5719cfab9f65976c07df3c92',
        createAt: 'Fri Apr 22 2016 15:16:01 GMT+0800 (CST)',
        reply: '5719cfc39f65976c07df3c96,5719cfbe9f65976c07df3c95,5719cfb79f65976c07df3c94',
        commentid: '5719cfb19f65976c07df3c93',
        fromUsername: '百里登风',
        toUsername: '百里登风',
        fromAvatar: '/images/defaultAvatar.png',
        scomments: [
			{
			    from: '57161e84c9f38d924576f66e',
			    to: '57161e84c9f38d924576f66e',
			    content: 'ssdfdsfd',
			    createAt: 'Fri Apr 22 2016 15:16:19 GMT+0800 (CST)',
			    commentid: '5719cfb19f65976c07df3c93',
			    praise: '57161e84c9f38d924576f66e,57161e84c9f38d924576f66e',
			    scommentid: '5719cfc39f65976c07df3c96',
			    fromUsername: '百里登风',
			    toUsername: '百里登风',
			    fromAvatar: '/images/defaultAvatar.png'
			} {
			    from: '57161e84c9f38d924576f66e',
			    to: '57161e84c9f38d924576f66e',
			    content: 'ssdfdsfd',
			    createAt: 'Fri Apr 22 2016 15:16:14 GMT+0800 (CST)',
			    commentid: '5719cfb19f65976c07df3c93',
			    praise: '57161e84c9f38d924576f66e,57161e84c9f38d924576f66e',
			    scommentid: '5719cfbe9f65976c07df3c95',
			    fromUsername: '百里登风',
			    toUsername: '百里登风',
			    fromAvatar: '/images/defaultAvatar.png'
			} {
			    from: '57161e84c9f38d924576f66e',
			    to: '57161e84c9f38d924576f66e',
			    content: 'ssdfdsfd',
			    createAt: 'Fri Apr 22 2016 15:16:07 GMT+0800 (CST)',
			    commentid: '5719cfb19f65976c07df3c93',
			    praise: '57161e84c9f38d924576f66e,57161e84c9f38d924576f66e',
			    scommentid: '5719cfb79f65976c07df3c94',
			    fromUsername: '百里登风',
			    toUsername: '百里登风',
			    fromAvatar: '/images/defaultAvatar.png'
			}
        ]
    }]
}
从mongodb中获取到的数据
{
	_id: '5719cfab9f65976c07df3c92',
    content: 'ssdfdsfd',
    picURL: '',
    createAt: 'Fri Apr 22 2016 15:15:55 GMT+0800 (CST)',
    userid: '57161e84c9f38d924576f66e',
    username: '百里登风',
    avatar: '/images/defaultAvatar.png',
    praise: [57161e84c9f38d924576f66e],
    comments: [{
        to: '57161e84c9f38d924576f66e',
        from: '57161e84c9f38d924576f66e',
        content: 'ssdfdsfd',
        praise: [57161e84c9f38d924576f66e,57161e84c9f38d924576f66e],
        createAt: 'Fri Apr 22 2016 15:16:01 GMT+0800 (CST)',
        _id: '5719cfb19f65976c07df3c93',
        fromUsername: '百里登风',
        toUsername: '百里登风',
        fromAvatar: '/images/defaultAvatar.png',
        scomments: [
			{
			    from: '57161e84c9f38d924576f66e',
			    to: '57161e84c9f38d924576f66e',
			    content: 'ssdfdsfd',
			    createAt: 'Fri Apr 22 2016 15:16:19 GMT+0800 (CST)',
			    praise: [57161e84c9f38d924576f66e,57161e84c9f38d924576f66e],
			    _id: '5719cfc39f65976c07df3c96',
			    fromUsername: '百里登风',
			    toUsername: '百里登风',
			    fromAvatar: '/images/defaultAvatar.png'
			}
        ]
    }]
}

fanspost:userid:* 保留18
currentpost:userid:* 保留36
indexpost:userid:* 保留60
