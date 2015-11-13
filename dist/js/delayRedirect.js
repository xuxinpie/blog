/**
 *
 * 定义全局变量,以项目名称命令,全局变量中定义function
 * 在对应的页面中引入全局变量,然后可以直接调用对应的方法
 * Created by Xinux on 11/12/15.
 */

var myBlog = myBlog || {};

myBlog = {
	delayUrl: function (url) {
		(function timeCount() {
			var delayTime = $('#J_Time').text();
			if (delayTime > 0) {
				delayTime--;
				$('#J_Time').text(delayTime);
			} else {
				window.location.href = url;
			}
			setTimeout(function () {
				timeCount(url);
			}, 1000);
		})();
	}
};