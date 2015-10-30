# gulp-babel [![Build Status](https://travis-ci.org/babel/gulp-babel.svg?branch=master)](https://travis-ci.org/babel/gulp-babel)

> Turn ES6 code into vanilla ES5 with no runtime required using [babel](https://github.com/babel/babel)

*Issues with the output should be reported on the babel [issue tracker](https://github.com/babel/babel/issues).*


## Install

```
$ npm install --save-dev gulp-babel babel-preset-es2015
```


## Usage

```js
var gulp = require('gulp');
var babel = require('gulp-babel');

gulp.task('default', function () {
	return gulp.src('src/app.js')
		.pipe(babel({
			presets: ['babel-preset-es2015']
		}))
		.pipe(gulp.dest('dist'));
});
```


## API

### babel([options])

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
contains the metadata from `babel.transform()`.

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

## Runtime

If you are attempting to use features such as generators, you will need to add `transform-runtime` as plugin to include the babel runtime. Otherwise you will receive the error: `regeneratorRuntime is not defined`.

Install the runtime:
```
npm install --save-dev babel-plugin-transform-runtime
```

Use it as plugin:
```js
var gulp = require('gulp');
var babel = require('gulp-babel');

gulp.task('default', function () {
	return gulp.src('src/app.js')
		.pipe(babel({ plugins: ['transform-runtime'] }))
		.pipe(gulp.dest('dist'));
});
```

## License

MIT © [Sindre Sorhus](http://sindresorhus.com)
