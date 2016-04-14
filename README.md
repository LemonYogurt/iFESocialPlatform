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

热点用户，维护一个20个人的链表

