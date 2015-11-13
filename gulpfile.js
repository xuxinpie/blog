var gulp = require('gulp'),
		less = require('gulp-less'),
		uglify = require('gulp-uglify'),
		jshint = require('gulp-jshint'),
		concat = require('gulp-concat'),
		watch = require('gulp-watch');

//var base64 = require('gulp-base64');

gulp.task('blog-less', ['blog-build'], function () {
	return gulp.start('less');
});

gulp.task('blog-build', function () {
	return gulp.src([
		'./public/**/*.*'
	])
			.pipe(gulp.dest('./dist'))
});

gulp.task('less', function () {
	gulp.src([
		'./dist/css/*.less'
	])
			.pipe(less())
			.pipe(gulp.dest('./dist/css/'));
});

// 监听less文件是否发生变化
gulp.task('watchStyle', ['blog-less'], function () {
	watch({glob: '.public/cs/*.less'}, function () {
		gulp.start('blog-less')
	})
});

//将public目录下的js进行混淆和压缩,并合并的一个blog.js文件中,放到dist目录下
gulp.task('scripts', function () {
	//排除delayRedirect.js
	//gulp.src(['./public/js/*.js', '!./public/js/delayRedirect.js'])
	gulp.src('./public/js/*.js')
			.pipe(jshint())
			.pipe(jshint.reporter('default'))
			.pipe(uglify())
			.pipe(concat('blog.js'))
			.pipe(gulp.dest('./dist/js'))
});

// 默认任务
gulp.task('default', ['blog-less', 'scripts'], function () {
	// 监听文件变化
	gulp.watch('./public/**/*.*', function () {
		gulp.start('blog-less', 'scripts');
	});
});