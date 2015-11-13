var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

var routes = require('./routes/index');
var settings = require('./settings');
//flash 是一个在 session 中用于存储信息的特定区域。信息写入 flash ，下一次显示完毕后即被清除
var flash = require('connect-flash');
//实现multer文件上传功能
var multer = require('multer');

//记录请求的日志以及错误日志
var fs = require('fs');
var accessLog = fs.createWriteStream('access.log', {flags: 'a'});
var errorLog = fs.createWriteStream('error.log', {flags: 'a'});

var app = express();

app.set('port', process.env.PORT || 3000);

/** NodeJS 路径问题 */
//只有在 require() 时才使用相对路径(./, ../) 的写法，其他地方一律使用绝对路径，如下：
// 当前目录下
//path.dirname(__filename) + '/test.js';
// 相邻目录下,可以通过 path.resolve('***')来转换为绝对路径
//path.resolve(__dirname, '../lib/common.js');

// view engine setup
//1. locate template positiion
app.set('views', path.join(__dirname, 'views'));
//2. use which template engine
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//设置/public/favicon.ico为favicon图标
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

//load log middleware
app.use(logger('dev'));
//write down log into a file
app.use(logger({stream: accessLog}));
//load json parse middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

//store session info into mongoDB
app.use(session({
	secret: settings.cookieSecret,
	key: settings.db,//cookie name
	cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//30 days
	store: new MongoStore({
		db: settings.db,
		host: settings.host,
		port: settings.port
	})
}));

app.use(flash());
//set static file directory
//__dirname: 总是返回被执行的 js 所在文件夹的绝对路径
//__filename: 总是返回被执行的 js 的绝对路径
app.use(express.static(path.join(__dirname, 'dist')));

app.use(multer({
	dest: './public/images',
	//修改文件上传后的文件名
	rename: function (fieldName, fileName) {
		return fileName;
	}
}));

//express没有记录错误日志的功能,需要写一个简单的错误日志记录middle ware
app.use(function (err, req, res, next) {
	var meta = '[' + new Date() + '] ' + req.url + '\n';
	errorLog.write(meta + err.stack + '\n');
	next();
});

//调用了index.js导出的函数
routes(app);

//app.listen(app.get('port'), function() {
//    console.log('Express server listening on port ' + app.get('port'));
//});


//set invest route
//app.use('/', routes);
//app.use('/users', users);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});


// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function (err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});


module.exports = app;
