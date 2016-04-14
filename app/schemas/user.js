var mongoose = require('mongoose');
/**
 * 这个库是专门为密码存储设计的算法
 * 主要是用它生成一个随机的盐，然后将密码和这个盐混合进来加密，就拿到最终要存储的密码
 */
var bcrypt = require('bcryptjs');

var UserSchema = new mongoose.Schema({
	_id: {
		unique: true,
		type: String
	},
	username: {
		unique: true,
		type: String
	},
	password: {
		type: String
	},
	avatar: {
		type: String
	},
	avatarFlag: {
		type: Boolean
	},
	createTime: {
		type: Date
	},
	updateTime: {
		type: Date
	}
});

/**
 * 在存储数据之前，调用该方法
 */
UserSchema.pre('save', function (next) {
	var user = this;
	user.updateTime = new Date();
	// 将请求传递下去
	next();
});

/*
创建实例方法
 */
UserSchema.methods = {
	comparePassword: function (_pwd, callback) {
		// 使用compare方法对密码进行比较，isMatch是bool类型，匹配成功返回true
		bcrypt.compare(_pwd, this.password, function (err, isMatch) {
			if (err) {
				return callback(err);
			} else {
				callback(null, isMatch);
			}
		});
	}
};

module.exports = UserSchema;