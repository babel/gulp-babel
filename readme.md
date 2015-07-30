# gulp-babel [![Build Status](https://travis-ci.org/babel/gulp-babel.svg?branch=master)](https://travis-ci.org/babel/gulp-babel)

> Turn ES6 code into vanilla ES5 with no runtime required using [babel](https://github.com/babel/babel)

*Issues with the output should be reported on the babel [issue tracker](https://github.com/babel/babel/issues).*


## Install

```
$ npm install --save-dev gulp-babel
```


## Usage

```js
var gulp = require('gulp');
var babel = require('gulp-babel');

gulp.task('default', function () {
	return gulp.src('src/app.js')
		.pipe(babel())
		.pipe(gulp.dest('dist'));
});
```


## API

### babel(options)

#### options

See the `babel` [options](https://babeljs.io/docs/usage/options/), except for `sourceMap` and `filename` which is handled for you.


## Source Maps

Use [gulp-sourcemaps](https://github.com/floridoo/gulp-sourcemaps) like this:

```js
var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var babel = require('gulp-babel');
var concat = require('gulp-concat');

gulp.task('default', function () {
	return gulp.src('src/**/*.js')
		.pipe(sourcemaps.init())
		.pipe(babel())
		.pipe(concat('all.js'))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('dist'));
});
```


## Babel Metadata

Files in the stream are annotated with a `babel` property, which
contains the [metadata](http://babeljs.io/docs/advanced/external-helpers/#selective-builds) from `babel.transform()`.

#### Example

```js
var gulp = require('gulp');
var babel = require('gulp-babel');
var through = require('through2');

function logFileHelpers() {
	return through.obj(function (file, enc, cb) {
		console.log(file.babel.usedHelpers);
		cb(null, file);
	});
}

gulp.task('default', function () {
	return gulp.src('src/**/*.js')
		.pipe(babel())
		.pipe(logFileHelpers);
})
```


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)
