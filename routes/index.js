//crypto模块是NodeJs的一个核心模块，用来生成散列值来加密密码
var crypto = require('crypto'),
		User = require('../models/user.js'),
		Post = require('../models/post.js'),
		Comment = require('../models/comment.js');

module.exports = function (app) {

	/* GET home page. */
	//app.get('/', checkLogin);

	/*app.get('/', function (req, res) {
	 Post.getAll(null, function (err, posts) {
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
	 });*/

	app.get('/', function (req, res) {
		//判断是否是第一页，并把请求的页数转换成 number 类型
		var page = req.query.p ? parseInt(req.query.p) : 1;
		//查询并返回第 page 页的 10 篇文章
		Post.getTen(null, page, function (err, posts, total) {
			if (err) {
				posts = [];
			}
			res.render('index', {
				title: 'HomePage',
				posts: posts,
				page: page,
				isFirstPage: (page - 1) == 0,
				isLastPage: ((page - 1) * 10 + posts.length) == total,
				user: req.session.user,
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
				tags = [req.body.tag1, req.body.tag2, req.body.tag3],
				post = new Post(currentUser.name, currentUser.head, req.body.title, tags, req.body.post);
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

	app.get('/upload', checkLogin);
	app.get('/upload', function (req, res) {
		res.render('upload', {
			title: 'Files Upload',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});

	app.post('/upload', checkLogin);
	app.post('/upload', function (req, res) {
		req.flash('success', '文件上传成功!');
		res.redirect('/upload');
	});

	//用户页面的路由规则 get all articles of one user
	/*app.get('/u/:name', function (req, res) {
	 //检查用户是否存在
	 User.get(req.params.name, function (err, user) {
	 if (!user) {
	 req.flash('error', '用户不存在!');
	 return res.redirect('/');//用户不存在则跳转到主页
	 }
	 //查询并返回该用户的所有文章
	 Post.getAll(user.name, function (err, posts) {
	 if (err) {
	 req.flash('error', err);
	 return res.redirect('/');
	 }
	 res.render('user', {
	 title: user.name,
	 posts: posts,
	 user: req.session.user,
	 success: req.flash('success').toString(),
	 error: req.flash('error').toString()
	 });
	 });
	 });
	 });*/

	//文章存档页面路由
	app.get('/archive', function (req, res) {
		Post.getArchive(function (err, posts) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/');
			}
			res.render('archive', {
				title: 'Archive',
				posts: posts,
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});

	//查看所有标签页面路由
	app.get('/tags', function (req, res) {
		Post.getTags(function (err, posts) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/');
			}
			res.render('tags', {
				title: "Tags",
				posts: posts,
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});

	//根据特定标签查看文章页面路由
	app.get('/tags/:tag', function (req, res) {
		Post.getTag(req.params.tag, function (err, posts) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/');
			}
			res.render('tag', {
				title: 'TAG:' + req.params.tag,
				posts: posts,
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});

	//根据搜索title查询对应文章的页面路由
	app.get('/search', function (req, res) {
		Post.search(req.query.keyword, function (err, posts) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/');
			}
			res.render('search', {
				//title: "SEARCH:" + req.query.keyword,
				title: "SEARCH RESULT",
				posts: posts,
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});

	//用户页面的路由规则 get 10 articles of one user per page
	app.get('/u/:name', function (req, res) {
		var page = req.query.p ? parseInt(req.query.p) : 1;
		//检查用户是否存在
		User.get(req.params.name, function (err, user) {
			if (!user) {
				req.flash('error', '用户不存在!');
				return res.redirect('/');
			}
			//查询并返回该用户第 page 页的 10 篇文章
			Post.getTen(user.name, page, function (err, posts, total) {
				if (err) {
					req.flash('error', err);
					return res.redirect('/');
				}
				res.render('user', {
					title: user.name,
					posts: posts,
					page: page,
					isFirstPage: (page - 1) == 0,
					isLastPage: ((page - 1) * 10 + posts.length) == total,
					user: req.session.user,
					success: req.flash('success').toString(),
					error: req.flash('error').toString()
				});
			});
		});
	});

	//文章页面的路由规则 get one article
	app.get('/u/:name/:day/:title', function (req, res) {
		Post.getOne(req.params.name, req.params.day, req.params.title, function (err, doc) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/');
			}
			res.render('article', {
				title: req.params.title,
				doc: doc,
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});

	//文章页面的路由规则,添加了留言功能
	app.post('/u/:name/:day/:title', function (req, res) {
		var date = new Date(),
				time = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
						date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
		var md5 = crypto.createHash('md5'),
				email_MD5 = md5.update(req.body.email.toLowerCase()).digest('hex'),
				head = "http://www.gravatar.com/avatar/" + email_MD5 + "?s=48";
		var comment = {
			name: req.body.name,
			head: head,
			email: req.body.email,
			website: req.body.website,
			time: time,
			content: req.body.content
		};
		var newComment = new Comment(req.params.name, req.params.day, req.params.title, comment);
		newComment.save(function (err) {
			if (err) {
				req.flash('error', err);
				return res.redirect('back');
			}
			req.flash('success', '留言成功!');
			res.redirect('back');
		});
	});

	//文章编辑页面路由 get one article for editing
	app.get('/edit/:name/:day/:title', checkLogin);
	app.get('/edit/:name/:day/:title', function (req, res) {
		var currentUser = req.session.user;
		Post.edit(currentUser.name, req.params.day, req.params.title, function (err, doc) {
			if (err) {
				req.flash('error', err);
				return res.redirect('back');
			}
			res.render('edit', {
				title: 'Edit',
				doc: doc,
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});

	app.post('/edit/:name/:day/:title', checkLogin);
	app.post('/edit/:name/:day/:title', function (req, res) {
		var currentUser = req.session.user;
		Post.update(currentUser.name, req.params.day, req.params.title, req.body.post, function (err) {
			var url = encodeURI('/u/' + req.params.name + '/' + req.params.day + '/' + req.params.title);
			if (err) {
				req.flash('error', err);
				return res.redirect(url);//出错！返回文章页
			}
			req.flash('success', '修改成功!');
			res.redirect(url);//成功！返回文章页
		});
	});

	//转载文章的页面路由
	app.get('/reprint/:name/:day/:title', checkLogin);
	app.get('/reprint/:name/:day/:title', function (req, res) {
		Post.edit(req.params.name, req.params.day, req.params.title, function (err, post) {
			if (err) {
				req.flash('error', err);
				return res.redirect(back);
			}
			var currentUser = req.session.user,
					reprint_from = {name: post.name, day: post.time.day, title: post.title},
					reprint_to = {name: currentUser.name, head: currentUser.head};
			Post.reprint(reprint_from, reprint_to, function (err, post) {
				if (err) {
					req.flash('error', err);
					return res.redirect('back');
				}
				req.flash('success', '转载成功!');
				var url = encodeURI('/u/' + post.name + '/' + post.time.day + '/' + post.title);
				//跳转到转载后的文章页面
				res.redirect(url);
			});
		});
	});

	//删除一篇文章
	app.get('/remove/:name/:day/:title', checkLogin);
	app.get('/remove/:name/:day/:title', function (req, res) {
		var currentUser = req.session.user;
		Post.remove(currentUser.name, req.params.day, req.params.title, function (err) {
			if (err) {
				req.flash('error', err);
				return res.redirect('back');
			}
			req.flash('success', '删除成功!');
			res.redirect('/');
		});
	});

	//get friendly link list
	app.get('/links', function (req, res) {
		res.render('links', {
			title: 'Friendly Link List',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});

	app.use(function (req, res) {
		res.render("404");
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

