# gulp-6to5 [![Build Status](https://travis-ci.org/6to5/gulp-6to5.svg?branch=master)](https://travis-ci.org/6to5/gulp-6to5)

> Turn ES6 code into vanilla ES5 with no runtime required using [6to5](https://github.com/sebmck/6to5)

*Issues with the output should be reported on the 6to5 [issue tracker](https://github.com/sebmck/6to5/issues).*


## Install

```sh
$ npm install --save-dev gulp-6to5
```


## Usage

```js
var gulp = require('gulp');
var to5 = require('gulp-6to5');

gulp.task('default', function () {
	return gulp.src('src/app.js')
		.pipe(to5())
		.pipe(gulp.dest('dist'));
});
```


## API

### 6to5(options)

#### options

See the `6to5` [options](https://6to5.org/usage.html#options), except for `sourceMap` and `filename` which is handled for you.


## Source Maps

Use [gulp-sourcemaps](https://github.com/floridoo/gulp-sourcemaps) like this:

```js
var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var to5 = require('gulp-6to5');
var concat = require('gulp-concat');

gulp.task('default', function () {
	return gulp.src('src/**/*.js')
		.pipe(sourcemaps.init())
		.pipe(to5())
		.pipe(concat('all.js'))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('dist'));
});
```


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)
