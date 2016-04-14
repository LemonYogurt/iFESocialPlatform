var mmh3 = require('murmurhash3');
var ObjectID = require('bson').ObjectID;

// var key = 'user:userid:124:username';

function Modulo() {
	this.nodes = []; //存储服务器节点
	this.nodeNum = 0; // 存储节点的个数
}

Modulo.prototype.get32 = function (key) {
	return mmh3.murmur32Sync(key, 2);
};

Modulo.prototype.addNode = function (nodeName) {
	if (this.nodes.indexOf(nodeName) != -1) {
		return ;
	} else {
		this.nodes.push(nodeName);
		this.nodeNum += 1;
	}

	return true;
};

Modulo.prototype.delNode = function (nodeName) {
	var _index = this.nodes.indexOf(nodeName);
	if (_index == -1) {
		return ;
	} else {
		this.nodes.splice(_index, 1);
		this.nodeNum -= 1;
	}

	return true;
};

Modulo.prototype.lookup = function (key) {
	var _point = this.get32(key);
	return this.nodes[_point % this.nodeNum];
};

// 需要传入服务器要分隔成多少个虚节点
var modulo = new Modulo();
modulo.addNode('a');
modulo.addNode('b');
modulo.addNode('c');

var key = 'user:userid:' + new ObjectID().toString() + ':username';
console.log(modulo.get32(key));
console.log('key:' + key + ' 落在' + modulo.lookup(key) + '服务器上');