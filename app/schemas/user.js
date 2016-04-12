var mongoose = require('mongoose');
/**
 * 这个库是专门为密码存储设计的算法
 * 主要是用它生成一个随机的盐，然后将密码和这个盐混合进来加密，就拿到最终要存储的密码
 */
var bcrypt = require('bcryptjs');
// 设置生成盐的复杂程度
var SALT_WORK_FACTOR = 10;

var UserSchema = new mongoose.Schema({
	username: {
		unique: true,
		type: String
	},
	password: {
		unique: true,
		type: String
	},
	avatar: {
		unique: true,
		type: String
	}
});

/**
 * 在存储数据之前，调用该方法
 */
UserSchema.pre('save', function (next) {
	var user = this;
	/**
	 * 生成一个随机的盐
	 * 两个参数：
	 * ①：计算强度
	 * ②：回调函数，在回调函数中能够拿到生成的盐
	 */
	bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
		if (err) {
			return next(err);
		}

		// 使用hash方法将密码和盐进行混合加密
		bcrypt.hash(user.password, salt, function (err, hash) {
			if (err) {
				return next(err);
			}

			user.password = hash;
			// 将请求传递下去
			next();
		});
	});
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