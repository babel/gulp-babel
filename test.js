'use strict';
const path = require('path');
const assert = require('assert');
const Vinyl = require('vinyl');
const sourceMaps = require('gulp-sourcemaps');
const babel = require('./');

it('should transpile with Babel', cb => {
	const stream = babel({
		plugins: ['@babel/transform-block-scoping']
	});

	stream.on('data', file => {
		assert(/var foo/.test(file.contents.toString()), file.contents.toString());
		assert.equal(file.relative, 'fixture.js');
	});

	stream.on('end', cb);

	stream.write(new Vinyl({
		cwd: __dirname,
		base: path.join(__dirname, 'fixture'),
		path: path.join(__dirname, 'fixture/fixture.jsx'),
		contents: Buffer.from('let foo;')
	}));

	stream.end();
});

it('should generate source maps', cb => {
	const init = sourceMaps.init();
	const write = sourceMaps.write();
	init
		.pipe(babel({
			plugins: ['@babel/transform-arrow-functions']
		}))
		.pipe(write);

	write.on('data', file => {
		assert.deepEqual(file.sourceMap.sources, ['fixture.es2015']);
		assert.strictEqual(file.sourceMap.file, 'fixture.js');
		const contents = file.contents.toString();
		assert(/function/.test(contents));
		assert(/sourceMappingURL/.test(contents));
		cb();
	});

	init.write(new Vinyl({
		cwd: __dirname,
		base: path.join(__dirname, 'fixture'),
		path: path.join(__dirname, 'fixture/fixture.es2015'),
		contents: Buffer.from('[].map(v => v + 1)'),
		sourceMap: ''
	}));

	init.end();
});

it('should generate source maps for file in nested folder', cb => {
	const init = sourceMaps.init();
	const write = sourceMaps.write();
	init
		.pipe(babel({
			plugins: ['@babel/transform-arrow-functions']
		}))
		.pipe(write);

	write.on('data', file => {
		assert.deepEqual(file.sourceMap.sources, ['nested/fixture.es2015']);
		assert.strictEqual(file.sourceMap.file, 'nested/fixture.js');
		const contents = file.contents.toString();
		assert(/function/.test(contents));
		assert(/sourceMappingURL/.test(contents));
		cb();
	});

	init.write(new Vinyl({
		cwd: __dirname,
		base: path.join(__dirname, 'fixture'),
		path: path.join(__dirname, 'fixture/nested/fixture.es2015'),
		contents: Buffer.from('[].map(v => v + 1)'),
		sourceMap: ''
	}));

	init.end();
});

it('should pass the result of transform().metadata in file.babel', cb => {
	const stream = babel({
		plugins: [{
			post(file) {
				file.metadata.test = 'metadata';
			}
		}]
	});

	stream.on('data', file => {
		assert.deepEqual(file.babel, {test: 'metadata'});
	});

	stream.on('end', cb);

	stream.write(new Vinyl({
		cwd: __dirname,
		base: path.join(__dirname, 'fixture'),
		path: path.join(__dirname, 'fixture/fixture.js'),
		contents: Buffer.from('class MyClass {};')
	}));

	stream.end();
});

it('should not rename ignored files', cb => {
	const stream = babel({
		ignore: [/fixture/]
	});

	const inputFile = {
		cwd: __dirname
	};

	inputFile.base = path.join(inputFile.cwd, 'fixture');
	inputFile.basename = 'fixture.jsx';
	inputFile.path = path.join(inputFile.base, inputFile.basename);
	inputFile.contents = Buffer.from(';');

	stream
		.on('data', file => {
			assert.equal(file.relative, inputFile.basename);
		})
		.on('end', cb)
		.end(new Vinyl(inputFile));
});

it('should not rename files without an extension', cb => {
	const stream = babel();

	const inputFile = {
		cwd: __dirname
	};

	inputFile.base = path.join(inputFile.cwd, 'bin');
	inputFile.basename = 'app';
	inputFile.path = path.join(inputFile.base, inputFile.basename);
	inputFile.contents = Buffer.from(';');

	stream
		.on('data', file => {
			assert.equal(file.relative, inputFile.basename);
		})
		.on('end', cb)
		.end(new Vinyl(inputFile));
});
