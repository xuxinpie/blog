/**
 * Created by Xinux on 9/18/15.
 */

var mongodb = require('./db');
var crypto = require('crypto');

function User(user) {
    this.name = user.name;
    this.password = user.password;
    this.email = user.email;
};

module.exports = User;

//存储用户信息
User.prototype.save = function (callback) {
    var md5 = crypto.createHash('md5'),
        email_MD5 = md5.update(this.email.toLowerCase()).digest('hex'),
        head = "http://www.gravatar.com/avatar/" + email_MD5 + "?s=48";
    var user = {
        name: this.name,
        password: this.password,
        email: this.email,
        head: head
    };

    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }

        //读取 users 集合
        db.collection('users', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err); //error, return error info
            }

            //将用户数据插入users
            collection.insert(user, {safe: true}, function (err, user) {
                mongodb.close();
                if (err) {
                    return callback(err);  //error, return error info
                }
                callback(null, user[0]); //success, err is null and return user info
            });
        });
    });
};

//读取用户信息
User.get = function (name, callback) {
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);//错误，返回 err 信息
        }
        //读取 users 集合
        db.collection('users', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);//错误，返回 err 信息
            }
            //查找用户名（name键）值为 name 一个文档
            collection.findOne({
                name: name
            }, function (err, user) {
                mongodb.close();
                if (err) {
                    return callback(err);//失败！返回 err 信息
                }
                callback(null, user);//成功！返回查询的用户信息
            });
        });
    });
};