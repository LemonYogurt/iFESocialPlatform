/**
 * 这个库是专门为密码存储设计的算法
 * 主要是用它生成一个随机的盐，然后将密码和这个盐混合进来加密，就拿到最终要存储的密码
 */
var bcrypt = require('bcryptjs');
// 设置生成盐的复杂程度
var SALT_WORK_FACTOR = 10;

function encrypt(password, callback) {
	bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
		if (err) {
			console.log('bcrypt', err);
		}

		// 使用hash方法将密码和盐进行混合加密
		bcrypt.hash(password, salt, function (err, hash) {
			if (err) {
				console.log(err);
			} else {
				callback(hash);
			}
		});
	});
}

module.exports = encrypt;