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

发布文章：
hmset article:_id:321 userid 123 createAt Date.now() content '' picURL ''
维护一个有序集合，用于粉丝拉取文章用的
zadd followerpost:userid:123 Date.now() articleid
获得元素的个数，如果超过了20个，则删除最后一个
zcard followerpost:userid:123
按照名次删除最后一个
zremrangebyrank followerpost:userid:123 0 0

每次发表文章的时候，就添加到当前用户的总的文章链表中，并且要判断当前的微博是否达到了20条，如果超出了20条，则将超出的内容存到数据库中
lpush currentpost:userid:123 articleId
判断，插入新的文章之后，如果超出了40条，则导入到mongo中
llen currentpost:userid:123 > 20

rpoplpush currentpost:userid:123 global:article

点击关注后：
sadd stars:userid:123 uid
sadd fans:userid:uid 123

如果点击了取消关注后，
srem stars:userid:123 uid
srem fans:userid:uid 123

首页：
首先获取的是文章：
查出所有关注的用户id以及自己的id，存放到一个数组中

接下来就要拉取文章了：
还需要维护一个普通的key，用户存放上次拉取微博的位置
get lastpull:userid:123 Date.now()
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
lpush homeArticle:userid:123 ....

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

