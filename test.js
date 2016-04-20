'use strict';
var path = require('path');
var assert = require('assert');
var gutil = require('gulp-util');
var sourceMaps = require('gulp-sourcemaps');
var babel = require('./');

it('should transpile with Babel', function (cb) {
	var stream = babel({
		plugins: ['transform-es2015-block-scoping']
	});

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
		.pipe(babel({
			plugins: ['transform-es2015-arrow-functions']
		}))
		.pipe(write);

	write.on('data', function (file) {
		assert.deepEqual(file.sourceMap.sources, ['fixture.es2015']);
		assert.strictEqual(file.sourceMap.file, 'fixture.js');
		var contents = file.contents.toString();
		assert(/function/.test(contents));
		assert(/sourceMappingURL/.test(contents));
		cb();
	});

	init.write(new gutil.File({
		cwd: __dirname,
		base: path.join(__dirname, 'fixture'),
		path: path.join(__dirname, 'fixture/fixture.es2015'),
		contents: new Buffer('[].map(v => v + 1)'),
		sourceMap: ''
	}));

	init.end();
});

it('should generate source maps for file in nested folder', function (cb) {
	var init = sourceMaps.init();
	var write = sourceMaps.write();
	init
		.pipe(babel({
			plugins: ['transform-es2015-arrow-functions']
		}))
		.pipe(write);

	write.on('data', function (file) {
		assert.deepEqual(file.sourceMap.sources, ['nested/fixture.es2015']);
		assert.strictEqual(file.sourceMap.file, 'nested/fixture.js');
		var contents = file.contents.toString();
		assert(/function/.test(contents));
		assert(/sourceMappingURL/.test(contents));
		cb();
	});

	init.write(new gutil.File({
		cwd: __dirname,
		base: path.join(__dirname, 'fixture'),
		path: path.join(__dirname, 'fixture/nested/fixture.es2015'),
		contents: new Buffer('[].map(v => v + 1)'),
		sourceMap: ''
	}));

	init.end();
});

it('should list used helpers in file.babel', function (cb) {
	var stream = babel({
		plugins: ['transform-es2015-classes']
	});

	stream.on('data', function (file) {
		assert.deepEqual(file.babel.usedHelpers, ['classCallCheck']);
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

it('should not rename ignored files', function (cb) {
	var stream = babel({
		ignore: /fixture/
	});

	var inputFile = {
		cwd: __dirname
	};

	inputFile.base = path.join(inputFile.cwd, 'fixture');
	inputFile.basename = 'fixture.jsx';
	inputFile.path = path.join(inputFile.base, inputFile.basename);
	inputFile.contents = new Buffer(';');

	stream
		.on('data', function (file) {
			assert.equal(file.relative, inputFile.basename);
		})
		.on('end', cb)
		.end(new gutil.File(inputFile));
});

it('should not rename files without an extension', function (cb) {
	var stream = babel();

	var inputFile = {
		cwd: __dirname
	};

	inputFile.base = path.join(inputFile.cwd, 'bin');
	inputFile.basename = 'app';
	inputFile.path = path.join(inputFile.base, inputFile.basename);
	inputFile.contents = new Buffer(';');

	stream
		.on('data', function (file) {
			assert.equal(file.relative, inputFile.basename);
		})
		.on('end', cb)
		.end(new gutil.File(inputFile));
});
