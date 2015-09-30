//crypto模块是NodeJs的一个核心模块，用来生成散列值来加密密码
var crypto = require('crypto'),
		User = require('../models/user.js'),
		Post = require('../models/post.js');


module.exports = function (app) {

		/* GET home page. */
		//app.get('/', checkLogin);
		app.get('/', function (req, res) {
				Post.get(null, function (err, posts) {
						if (err) {
								posts = [];
						}
						res.render('index',
								{
										title: 'HomePage',
										user: req.session.user,
										posts: posts,
										success: req.flash('success').toString(),
										error: req.flash('error').toString()
								});
				});

		});

		/* GET register page */
		app.get('/reg', checkNotLogin);
		app.get('/reg', function (req, res) {
				res.render('reg', {
						title: 'Register',
						user: req.session.user,
						success: req.flash('success').toString(),
						error: req.flash('error').toString()
				});
		});

		app.post('/reg', checkNotLogin);
		app.post('/reg', function (req, res) {
				var name = req.body.name,
						email = req.body.email,
						password = req.body.password,
						password_re = req.body['password-repeat'];
				//check two password inputted is equal
				if (password_re != password) {
						req.flash('error', '两次输入的密码不一致');
						return res.redirect('/reg');  //return to the register page
				}

				// gen md5 of password
				var md5 = crypto.createHash('md5'),
						password = md5.update(password).digest('hex');
				var newUser = new User({
						name: name,
						password: password,
						email: email
				});

				//check if user name is already existed
				User.get(newUser.name, function (err, user) {
						if (err) {
								req.flash('error', err);
								return res.redirect('/');
						}

						if (user) {
								req.flash('error', '用户已存在！');
								return res.redirect('/reg');
						}

						newUser.save(function (err, user) {
								if (err) {
										req.flash('error', err);
										return res.redirect('/reg'); // user sign in failed, return to the reg page
								}
								req.session.user = user; // store user info ino session
								req.flash('success', 'Register Successfully！');
								res.redirect('/'); // sign in succeeded, return to the main page
						});
				});

		});

		/* GET login page */
		app.get('/login', checkNotLogin);
		app.get('/login', function (req, res) {
				res.render('login', {
						title: 'Login',
						user: req.session.user,
						success: req.flash('success').toString(),
						error: req.flash('error').toString()
				});
		});

		app.post('/login', checkNotLogin);
		app.post('/login', function (req, res) {
				//生成密码的 md5 值
				var md5 = crypto.createHash('md5'),
						password = md5.update(req.body.password).digest('hex');
				//检查用户是否存在
				User.get(req.body.name, function (err, user) {
						if (!user) {
								req.flash('error', '用户不存在!');
								return res.redirect('/login');//用户不存在则跳转到登录页
						}
						//检查密码是否一致
						if (user.password != password) {
								req.flash('error', '密码错误!');
								return res.redirect('/login');//密码错误则跳转到登录页
						}
						//用户名密码都匹配后，将用户信息存入 session
						req.session.user = user;
						//写入flash，显示一次之后会自动清楚
						req.flash('success', 'Login Successfully!');
						res.redirect('/');//登陆成功后跳转到主页
				});
		});

		/* GET post page */
		app.get('post', checkLogin);
		app.get('/post', function (req, res) {
				res.render('post',
						{
								title: 'Post',
								user: req.session.user,
								success: req.flash('success').toString(),
								error: req.flash('error').toString()
						});
		});

		app.post('/post', checkLogin);
		app.post('/post', function (req, res) {
				var currentUser = req.session.user,
						post = new Post(currentUser.name, req.body.title, req.body.post);
				post.save(function (err) {
						if (err) {
								req.flash('error', err);
								return res.redirect('/'); //publish failed， return to the main page and print err message
						}

						req.flash('success', 'Publish Success!');
						res.redirect('/'); //publish successfully and return to the main page
				});

		});

		/* GET logout return to the main page */
		app.get('/logout', checkLogin);
		app.get('/logout', function (req, res) {
				req.session.user = null;
				req.flash('success', 'Logout Successfully');
				res.redirect('/');  //redirect to the main page when logout successfully
		});

		function checkLogin(req, res, next) {
				if (!req.session.user) {
						req.flash('error', 'Not Login!');
						res.redirect('/login');
				}

				next();
		}

		function checkNotLogin(req, res, next) {
				if (req.session.user) {
						req.flash('error', 'Logged in!');
						res.redirect('back');
				}
				next();
		}

};

