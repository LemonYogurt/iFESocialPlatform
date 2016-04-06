var mmh3 = require('murmurhash3');
var ObjectID = require('bson').ObjectID;

// var key = 'user:userid:124:username';

function consistentHash(nodeNum) {
	this.nodeNum = nodeNum;
	// 存放节点
	this.nodes = {};
	// 存放位置
	this.position = {};
	// 存放服务器生成的节点
	this.cirque = [];
}

consistentHash.prototype.get32 = function (key) {
	return mmh3.murmur32Sync(key, 2);
};

consistentHash.prototype.addNode = function (nodeName) {
	if (this.nodes[nodeName]) {
		return;
	}
	this.nodes[nodeName] = [];
	for (var i = 0; i < this.nodeNum; i++) {
		// 生成32位的值
		var _pos = this.get32(nodeName + '-' + i);
		// 将虚节点保存到圆环上
		this.cirque.push(_pos);
		// 将64个虚节点对应节点名
		this.position[_pos] = nodeName;
		// 把当前节点的64个虚节点保存到对应的数组中
		this.nodes[nodeName].push(_pos);
	}

	// 升序排序
	this.cirque.sort(function (a, b) {
		return a - b;
	});
};

consistentHash.prototype.delNode = function (nodeName) {
	if (!this.nodes[nodeName]) {
		return ;
	} else {
		// 删除position中的对应的节点
		for (var i = 0; i < this.nodes[nodeName].length; i++) {
			delete this.position[this.nodes[nodeName][i]];
		}
		// 删除nodes节点
		delete this.nodes[nodeName];
	}
};

// 查询key落在那台服务器上
consistentHash.prototype.lookup = function (key) {
	var _point = this.get32(key);
	var _node = this.cirque[0];

	if (_point > this.cirque[this.cirque.length - 1]) {
		;
	} else {
		for (var i = 0; i < this.cirque.length; i++) {
			if (_point <= this.cirque[i]) {
				_node = this.cirque[i];
				break;
			}
		}
	}
	return this.position[_node];
};

// 需要传入服务器要分隔成多少个虚节点
var consisH = new consistentHash(64);
consisH.addNode('a');
consisH.addNode('b');
consisH.addNode('c');

var key = 'user:userid:' + new ObjectID().toString() + ':username';

console.log('key:' + key + ' 落在' + consisH.lookup(key) + '服务器上');