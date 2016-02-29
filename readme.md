# gulp-babel [![Build Status](https://travis-ci.org/babel/gulp-babel.svg?branch=master)](https://travis-ci.org/babel/gulp-babel)

> Use next generation JavaScript, today, with [Babel](https://babeljs.io)

*Issues with the output should be reported on the Babel [issue tracker](https://github.com/babel/babel/issues).*


## Install

```
$ npm install --save-dev gulp-babel babel-preset-es2015
```


## Usage

```js
const gulp = require('gulp');
const babel = require('gulp-babel');

gulp.task('default', () =>
	gulp.src('src/app.js')
		.pipe(babel({
			presets: ['es2015']
		}))
		.pipe(gulp.dest('dist'))
);
```


## API

```js
const createBabel = require('gulp-babel');

/**
 * @see https://github.com/isaacs/node-lru-cache#options
 */
type lruOptions = {
	max: ?number,
	length: ?Function,
	dispose: ?Function,
	maxAge: ?number
};

/**
 * @see See the Babel options (https://babeljs.io/docs/usage/options/), except for `sourceMap` and `filename` which is handled for you.
 */
type babelOptions = {};

const babel = createBabel({max: 500}: lruOptions);

babel({}: babelOptions);
```

## Source Maps

Use [gulp-sourcemaps](https://github.com/floridoo/gulp-sourcemaps) like this:

```js
const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const createBabel = require('gulp-babel');
const concat = require('gulp-concat');

const babel = createBabel();

gulp.task('default', () =>
	gulp.src('src/**/*.js')
		.pipe(sourcemaps.init())
		.pipe(babel({
			presets: ['es2015']
		}))
		.pipe(concat('all.js'))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('dist'))
);
```

## Babel Metadata

Files in the stream are annotated with a `babel` property, which contains the metadata from [`babel.transform()`](https://babeljs.io/docs/usage/api/).

#### Example

```js
const gulp = require('gulp');
const createBabel = require('gulp-babel');
const through = require('through2');

const babel = createBabel();

function logFileHelpers() {
	return through.obj((file, enc, cb) => {
		console.log(file.babel.usedHelpers);
		cb(null, file);
	});
}

gulp.task('default', () =>
	gulp.src('src/**/*.js')
		.pipe(babel({
			presets: ['es2015']
		}))
		.pipe(logFileHelpers())
)
```


## Runtime

If you're attempting to use features such as generators, you'll need to add `transform-runtime` as a plugin, to include the Babel runtime. Otherwise, you'll receive the error: `regeneratorRuntime is not defined`.

Install the runtime:

```
$ npm install --save-dev babel-plugin-transform-runtime
```

Use it as plugin:

```js
const gulp = require('gulp');
const createBabel = require('gulp-babel');

const babel = createBabel();

gulp.task('default', () =>
	gulp.src('src/app.js')
		.pipe(babel({
			plugins: ['transform-runtime']
		}))
		.pipe(gulp.dest('dist'))
);
```


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)
