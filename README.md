## murmurhash3
https://github.com/hideo55/node-murmurhash3

注册用户：
set user:username:liuying:userid ...
set user:userid:123:password ...
set user:userid:123:username ...

每个用户维护一个hash结构：
_id
username
password
createTime
avatar

注册用户：
users:username:test:_id 123
users:_id:123:username test
users:_id:123:password 123456
users:_id:123:avatar ...
users:_id:123:avatarFlag ...
users:_id:123:createAt ...

热点用户，维护一个25个人的链表
lpush latestreguserlink _id
ltrim latestreguserlink 0 23
lrange latestreguserlink 0 -1

关注链表
sadd following:_id:123 1 2 3 4
sismember following:_id:123 1

点击关注后：
sadd stars:userid:123 uid
sadd fans:userid:uid 123

如果点击了取消关注后，
srem stars:userid:123 uid
srem fans:userid:uid 123

首页：
首先获取的是文章：
查出所有关注的用户id以及自己的id，存放到一个数组中


计算粉丝的个数：
scard following:userid:123
scard follower:userid:123

最后，根据id获取到文章的内容

// 获取当前关注的人数
scard stars:userid:123
// 获取当前粉丝的人数
scard fans:userid:123


首页：sideBody
最新注册用户部分：
点击关注后，在stars和fans无序集合中添加对应的用户id
之后，移除当前元素，并且将后面隐藏的元素显示出来，之后再进行判断显示的元素长度，如果小于6个的话，最后的查看更多按钮就隐藏起来

文章：
hmset article:articleid:123 content "" picURL "" createAt (new Date()).toString() userid 123 praise [].toString()

评论用一个链表维护起来
key：comment:articleid:123
value：评论的id

而每一条评论用一个hash集合维护起来，
hmset comment:commentid:234
from 123 to 234 content '' reply 将评论的内容用字符串分割开

评论的回复：
当前用户就是from
点击的那个用户就是to
获取from to之后，再获取是哪条评论，commentid

评论：
首先给文章增加一个commentsid字段，是一个数组，用于存放该文章评论的id

key：comment:commentid:123
value：
articleid：12345
from：userid
to：userid
content：''
createAt: ''
praise: [userid]
reply: [replycommentid]

replycomment:replycommentid:123456
from：userid
to：userid
content：''
createAt: ''
praise: [userid]

前端要进行评论，需要获得文章的userid，articleid，content

回复功能：
hash集合存储
replycomment:replycommentid:123456
from：userid
to：userid
content：''
createAt: ''
praise: [userid]

点击回复按钮，判断按钮的文字是否是回复，如果是的话，进行回复功能

然后打开输入框，获取焦点，可以给发表按钮增加一个class，点击回复的时候
增加一个class，失去焦点的时候，该class删除

并且在文本框中增加回复的字样

点击回复后，在回复框上插入一个span，并且将要回复的评论的id缓存在当前的span上
当点击发布的时候，就根据缓存的id，查询出当前文章对应的评论id，然后将回复的内容插入到对应的主评论下面

缓存的位置：
要在每一条主评论的div上缓存下评论的id
并且要在回复按钮上缓存主评论的id，可以说是操作按钮上都要缓存，无论是删除还是回复



commentsid -> commentid
reply -> replycommentid

Redis保存文章
维护一个有序集合，只需要维护20个即可，粉丝拉取文章的时候用
zadd fanspost:userid:57161e84c9f38d924576f66e Date.now() articleid
获得元素的个数
zcard fanspost:userid:57161e84c9f38d924576f66e
如果超过了20个，则删除最后一个，按照名次删除最后一个
zremrangebyrank fanspost:userid:57161e84c9f38d924576f66e 0 0

每次发表文章的时候，就添加到当前用户的总的文章链表中，并且要判断当前的微博是否达到了40条，如果超出了40条，则将超出的内容存到数据库中
lpush currentpost:userid:57161e84c9f38d924576f66e articleId
判断，插入新的文章之后，如果超出了40条，则导入到mongo中
llen currentpost:userid:57161e84c9f38d924576f66e > 40
rpoplpush currentpost:userid:57161e84c9f38d924576f66e global:article

接下来就要拉取文章了：
还需要维护一个普通的key，用户存放上次拉取微博的位置
get lastpull:userid:57161e84c9f38d924576f66e

如果第一次拉取文章，先设置为0

然后将每个用户的文章进行拉取：
上次的拉取点（上次拉取的时间戳）
lastPullTimeStamp
从用户维护的20个文章中拉取

zrangebyscore followerpost:userid:123 lastPullTimeStamp Date.now()

如果获取的集合中，没有内容的话，就不设置上次拉取点lastPullTimeStamp

如果有内容的话，则设置lastPullTimeStamp拉取点为当前的时间戳
set lastPullTimeStamp:userid:123 Date.now()

然后将所有的内容放到自己首页需要显示的文章列表中
lpush homepost:userid:123 ....


article
{
	articleid:
	avatar:
	userid:
	username:
	content:
	createAt:
	picURL:
	praise:[]
	comments: [
		{
			commentid:
			from:
			to:
			content:
			articleid:
			createAt:
			praise:[]
			reply:[
				{
					scommentid:
					from:
					to:
					content:
					createAt:
					praise:[]
				}
			]
		}
	]
}

关注与被关注的Redis存储：

Set（无序集合）
stars:userid:571ae94d5b5bf3ce1a80cf7c
fans:userid:571aeace5b5bf3ce1a80cf7f
stars:userid:571aeace5b5bf3ce1a80cf7f
fans:userid:571ae94d5b5bf3ce1a80cf7c

点击关注后：
在当前用户的stars集合中插入关注用户的id
在关注用户的fans集合中插入当前用户的id

发表文章的Redis存储：
Redis存储文章：
(hash) 
key-article:articleid:5718b9c342e2c86c4c57d21f
value-content     文章内容
value-picURL      文章图片
value-createAt    文章发布时间
value-userid      发布文章的用户
value-praise      文章点赞
value-commentsid  文章的主评论

(hash)
key-comment:commentid:5718b4a242e2c86c4c57d217
value-articleid   文章id
value-from        评论id
value-to          被评论id
value-content     评论的内容
value-createAt    评论的时间
value-praise      评论点赞
value-reply       评论回复

(hash)
key-replycomment:replycommentid:5718b4b442e2c86c4c57d218
value-from        回复id
value-to          被回复id
value-createAt    回复时间
value-commentid   评论id
value-content     回复内容
value-praise      回复赞

ZSet（有序集合）
fanspost:userid:571afd8969bd64f21a14fa96
value-score:Date.now() value:articleid

List（链表）
currentpost:userid:571afd8969bd64f21a14fa96
value-articleid



