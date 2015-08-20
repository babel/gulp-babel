'use strict';
var path = require('path');
var assert = require('assert');
var gutil = require('gulp-util');
var sourceMaps = require('gulp-sourcemaps');
var babel = require('./');

it('should transpile with Babel', function (cb) {
	var stream = babel();

	stream.on('data', function (file) {
		assert(/var foo/.test(file.contents.toString()), file.contents.toString());
		assert.equal(file.relative, 'fixture.js');
	});

	stream.on('end', cb);

	stream.write(new gutil.File({
		cwd: __dirname,
		base: path.join(__dirname, 'fixture'),
		path: path.join(__dirname, 'fixture/fixture.jsx'),
		contents: new Buffer('let foo;')
	}));

	stream.end();
});

it('should generate source maps', function (cb) {
	var init = sourceMaps.init();
	var write = sourceMaps.write();
	init
		.pipe(babel())
		.pipe(write);

	write.on('data', function (file) {
		assert.deepEqual(file.sourceMap.sources, ['fixture.es6']);
		assert.strictEqual(file.sourceMap.file, 'fixture.js');
		var contents = file.contents.toString();
		assert(/function/.test(contents));
		assert(/sourceMappingURL/.test(contents));
		cb();
	});

	init.write(new gutil.File({
		cwd: __dirname,
		base: path.join(__dirname, 'fixture'),
		path: path.join(__dirname, 'fixture/fixture.es6'),
		contents: new Buffer('[].map(v => v + 1)'),
		sourceMap: ''
	}));

	init.end();
});

it('should list used helpers in file.babel', function (cb) {
	var stream = babel();

	stream.on('data', function (file) {
		assert.deepEqual(file.babel.usedHelpers, ['class-call-check']);
	});

	stream.on('end', cb);

	stream.write(new gutil.File({
		cwd: __dirname,
		base: path.join(__dirname, 'fixture'),
		path: path.join(__dirname, 'fixture/fixture.js'),
		contents: new Buffer('class MyClass {};')
	}));

	stream.end();
});
