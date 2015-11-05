/**
 * Created by Xinux on 9/21/15.
 */
var mongodb = require('./db');
var markdown = require('markdown').markdown;

function Post(name, title, post) {
	this.name = name;
	this.title = title;
	this.post = post;
}

module.exports = Post;

//存储一篇文章及其相关信息
Post.prototype.save = function (callback) {
	var date = new Date();
	//存储各种时间格式，方便以后扩展
	var time = {
		date: date,
		year: date.getFullYear(),
		month: date.getFullYear() + "-" + (date.getMonth() + 1),
		day: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
		minute: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
		date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
	}

	//把文章前后的空格去除
	var articleTitle = this.title.trim();
	console.log(articleTitle);

	//要存入数据库的文档
	var post = {
		name: this.name,
		time: time,
		title: articleTitle,
		post: this.post,
		comments: new Array()
	};

	//打开数据库
	mongodb.open(function (err, db) {
		//错误返回
		if (err) {
			return callback(err);
		}

		//读取posts 集合
		db.collection('posts', function (err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			//将文档插入posts 集合
			collection.insert(post, {safe: true}, function (err) {
				mongodb.close();
				if (err) {
					return callback(err); //error! return error info
				}
				callback(null); //return error is null
			});
		});
	});
};

//读取文章及其相关信息(获取一个人的所有文章)
Post.getAll = function (name, callback) {
	//打开数据库
	mongodb.open(function (err, db) {
		if (err) {
			return callback(err);
		}

		//读取posts集合
		db.collection('posts', function (err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}

			var query = {};
			//根据name设置查找条件
			if (name) {
				query.name = name;
			}
			//根据query对象设置查询对象
			collection.find(query).sort({
				time: -1
			}).toArray(function (err, docs) {
				mongodb.close();
				if (err) {
					return callback(err); //Error! return error info
				}
				//判断该用户文章列表是否为空,不为空情况下将文章进行解析
				//解析 markdown 为 html
				if (docs) {
					docs.forEach(function (doc) {
						doc.post = markdown.toHTML(doc.post);
					});
				}
				callback(null, docs); // Succeeded! return query result in type of Array
			});
		});
	});
};

//获取一篇文章
Post.getOne = function (name, day, title, callback) {
	//打开数据库
	mongodb.open(function (err, db) {
		if (err) {
			return callback(err);
		}
		//读取 posts 集合
		db.collection('posts', function (err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			console.log(title);
			//根据用户名、发表日期及文章名进行查询
			collection.findOne({
				"name": name,
				"time.day": day,
				"title": title
			}, function (err, doc) {
				mongodb.close();
				if (err) {
					return callback(err);
				}
				//解析 markdown 为 html
				console.log(doc);
				if (doc) {
					//将文章转为markdown格式
					doc.post = markdown.toHTML(doc.post);
					//将评论转为markdown格式
					//需要判断该数组是否存在,否则forEach会报错
					if (doc.comments) {
						doc.comments.forEach(function (comment) {
							comment.content = markdown.toHTML(comment.content);
						});
					}
				}
				console.log(doc);
				callback(null, doc);//返回查询的一篇文章
			});
		});
	});
};

//返回原始发表的内容（markdown 格式）
Post.edit = function (name, day, title, callback) {
	//打开数据库
	mongodb.open(function (err, db) {
		if (err) {
			return callback(err);
		}
		//读取 posts 集合
		db.collection('posts', function (err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			//根据用户名、发表日期及文章名进行查询
			collection.findOne({
				"name": name,
				"time.day": day,
				"title": title
			}, function (err, doc) {
				mongodb.close();
				if (err) {
					return callback(err);
				}
				//解析 markdown 为 html
				if (doc) {
					//将文章转为markdown格式
					doc.post = markdown.toHTML(doc.post);
				}
				callback(null, doc);//返回查询的一篇文章（markdown 格式）
			});
		});
	});
};

//更新一篇文章及其相关信息
Post.update = function (name, day, title, post, callback) {
	//打开数据库
	mongodb.open(function (err, db) {
		if (err) {
			return callback(err);
		}
		//读取 posts 集合
		db.collection('posts', function (err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			//更新文章内容
			collection.update({
				"name": name,
				"time.day": day,
				"title": title
			}, {
				$set: {post: post}
			}, function (err) {
				mongodb.close();
				if (err) {
					return callback(err);
				}
				callback(null);
			});
		});
	});
};

//删除一篇文章
Post.remove = function (name, day, title, callback) {
	//打开数据库
	mongodb.open(function (err, db) {
		if (err) {
			return callback(err);
		}
		//读取 posts 集合
		db.collection('posts', function (err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			//根据用户名、日期和标题查找并删除一篇文章
			collection.remove({
				"name": name,
				"time.day": day,
				"title": title
			}, {
				w: 1
			}, function (err) {
				mongodb.close();
				if (err) {
					return callback(err);
				}
				callback(null);
			});
		});
	});
};

