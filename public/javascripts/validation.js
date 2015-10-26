/**
 * Created by Xinux on 10/21/15.
 */

//var $ = require('jquery');

$(function () {
		// var validator = $("#form1").validate({
		//   submitHandler: function(form) {
		//       alert("提交成功");
		//       form.submit(); //没有这一句表单不会提交
		//   }
		// });


		$('#J_submit').click(function () {
				if (validation()) {
						$('#J_form-register').submit();
				} else {
						return false;
				}
		});

		function checkEmail(mailAddress) {
				var emailReg = /^[A-Za-zd]+([-_.][A-Za-zd]+)*@([A-Za-zd]+[-.])+[A-Za-zd]{2,5}$/;
				var checkResult = emailReg.test(mailAddress);
				return checkResult;
		}

		// 用于J_form表单验证
		function validation() {

				var ok1 = false;
				var ok2 = false;
				var ok3 = false;
				var ok4 = false;

				//验证输入姓名
				if ($('input[name="name"]').val() === '') {
						$('input[name="name"]').parent().parent().attr('class', 'form-group has-error');
						$('input[name="name"]').parent().siblings('.form-tip').text('用户名不能为空');
						ok1 = false;
				} else if ($('input[name="password"]').val().length > 20) {
						$('input[name="name"]').parent().parent().attr('class', 'form-group has-error');
						$('input[name="name"]').parent().siblings('.form-tip').text('用户名不能超过20个字符');
						ok1 = false;
				} else {
						ok1 = true;
				}

				//验证密码
				if ($('input[name="password"]').val() === '') {
						$('input[name="password"]').parent().parent().attr('class', 'form-group has-error');
						$('input[name="password"]').parent().siblings('.form-tip').text('请输入密码');
						ok2 = false;
				} else if ($('input[name="password"]').val().length < 6) {
						$('input[name="password"]').parent().parent().attr('class', 'form-group has-error');
						$('input[name="password"]').parent().siblings('.form-tip').text('密码不能小于6个字符');
						ok2 = false;
				} else {
						ok2 = true;
				}

				//验证确认密码
				if ($('input[name="password-repeat"]').val() === '') {
						$('input[name="password-repeat"]').parent().parent().attr('class', 'form-group has-error');
						$('input[name="password-repeat"]').parent().siblings('.form-tip').text('请输入确认密码');
						ok3 = false;
				} else if ($('input[name="password-repeat"]').val() !== $('input[name="password"]').val()) {
						$('input[name="password-repeat"]').parent().parent().attr('class', 'form-group has-error');
						$('input[name="password-repeat"]').parent().siblings('.form-tip').text('两次输入密码不一致!');
						ok3 = false;
				} else {
						ok3 = true;
				}

				//验证邮箱地址
				if ($('input[name="email"]').val() === '') {
						$('input[name="email"]').parent().parent().attr('class', 'form-group has-error');
						$('input[name="email"]').parent().siblings('.form-tip').text('邮箱地址不能为空');
						ok4 = false;
				} else if (!checkEmail($('input[name="email"]').val())) {
						$('input[name="email"]').parent().parent().attr('class', 'form-group has-error');
						$('input[name="email"]').parent().siblings('.form-tip').text('邮箱地址格式有误!');
						ok4 = false;
				} else {
						ok4 = true;
				}

				if (ok1 && ok2 && ok3 && ok4) {
						return true;
				} else {
						return false;
				}

		}

		// 验证姓名
		$('input[name="name"]').focus(function () {
				$(this).parent().parent().attr('class', 'form-group');
				$(this).parent().siblings('.form-tip').text('');
		}).blur(function () {
				if ($(this).val() === '') {
						$(this).parent().parent().attr('class', 'form-group has-error');
						$(this).parent().siblings('.form-tip').text('用户名不能为空');
				} else if ($(this).val().length > 20) {
						$(this).parent().parent().attr('class', 'form-group has-error');
						$(this).parent().siblings('.form-tip').text('用户名不能超过20个字符');
				}
		});

		// 验证密码
		$('input[name="password"]').focus(function () {
				$(this).parent().parent().attr('class', 'form-group');
				$(this).parent().siblings('.form-tip').text('');
		}).blur(function () {
				if ($(this).val() === '') {
						$(this).parent().parent().attr('class', 'form-group has-error');
						$(this).parent().siblings('.form-tip').text('请输入密码');
				} else if ($(this).val().length < 6) {
						$(this).parent().parent().attr('class', 'form-group has-error');
						$(this).parent().siblings('.form-tip').text('密码不能小于6个字符');
				}
		});

		// 验证确认密码
		$('input[name="password-repeat"]').focus(function () {
				$(this).parent().parent().attr('class', 'form-group');
				$(this).parent().siblings('.form-tip').text('');
		}).blur(function () {
				if ($(this).val() === '') {
						$(this).parent().parent().attr('class', 'form-group has-error');
						$(this).parent().siblings('.form-tip').text('请输入确认密码');
				} else if ($(this).val() !== $('input[name="password"]').val()) {
						$(this).parent().parent().attr('class', 'form-group has-error');
						$(this).parent().siblings('.form-tip').text('两次输入密码不一致!');
				}
		});

		// 验证邮箱
		$('input[name="email"]').focus(function () {
				$(this).parent().parent().attr('class', 'form-group');
				$(this).parent().siblings('.form-tip').text('');
		}).blur(function () {
				if ($(this).val() === '') {
						$(this).parent().parent().attr('class', 'form-group has-error');
						$(this).parent().siblings('.form-tip').text('邮箱地址不能为空');
				} else if (!checkEmail($(this).val())) {
						$(this).parent().parent().attr('class', 'form-group has-error');
						$(this).parent().siblings('.form-tip').text('邮箱地址格式有误!');
				}
		});

		//$(function(){} end
});
