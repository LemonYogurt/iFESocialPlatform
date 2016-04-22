var arr = [{createAt: new Date('Thu Apr 21 2016 19:31:18 GMT+0800 (CST)')}];
arr.push({createAt: new Date('Thu Apr 21 2016 19:29:18 GMT+0800 (CST)')});
arr.push({createAt: new Date('Thu Apr 21 2016 19:21:18 GMT+0800 (CST)')});
arr.push({createAt: new Date('Thu Apr 21 2016 19:24:18 GMT+0800 (CST)')});
arr.push({createAt: new Date('Thu Apr 21 2016 19:19:18 GMT+0800 (CST)')});
arr.push({createAt: new Date('Thu Apr 21 2016 19:10:18 GMT+0800 (CST)')});
arr.push({createAt: new Date('Thu Apr 21 2016 19:27:18 GMT+0800 (CST)')});
arr.push({createAt: new Date('Thu Apr 21 2016 19:48:18 GMT+0800 (CST)')});
arr.push({createAt: new Date('Thu Apr 21 2016 19:42:18 GMT+0800 (CST)')});
arr.push({createAt: new Date('Thu Apr 21 2016 19:26:18 GMT+0800 (CST)')});

arr.sort(function (a, b) {
	return a.createAt - b.createAt;
});

for (var i = 0; i < arr.length; i++) {
	console.log(arr[i].createAt.getTime());
}
/*
升序排序
1461237018000
1461237558000
1461237678000
1461237858000
1461237978000
1461238038000
1461238158000
1461238278000
1461238938000
1461239298000
*/
