'use strict';
const path = require('path');
const gutil = require('gulp-util');
const through = require('through2');
const applySourceMap = require('vinyl-sourcemaps-apply');
const replaceExt = require('replace-ext');
const babel = require('babel-core');

function replaceExtension(fp) {
	return path.extname(fp) ? replaceExt(fp, '.js') : fp;
}

module.exports = function (opts) {
	opts = opts || {};

	return through.obj(function (file, enc, cb) {
		if (file.isNull()) {
			cb(null, file);
			return;
		}

		if (file.isStream()) {
			cb(new gutil.PluginError('gulp-babel', 'Streaming not supported'));
			return;
		}

		try {
			const fileOpts = Object.assign({}, opts, {
				filename: file.path,
				filenameRelative: file.relative,
				sourceMap: Boolean(file.sourceMap),
				sourceFileName: file.relative,
				sourceMapTarget: file.relative
			});

			const res = babel.transform(file.contents.toString(), fileOpts);

			if (res !== null) {
				if (file.sourceMap && res.map) {
					res.map.file = replaceExtension(res.map.file);
					applySourceMap(file, res.map);
				}

				if (!res.ignored) {
					file.contents = new Buffer(res.code); // eslint-disable-line unicorn/no-new-buffer
					file.path = replaceExtension(file.path);
				}

				file.babel = res.metadata;
			}

			this.push(file);
		} catch (err) {
			this.emit('error', new gutil.PluginError('gulp-babel', err, {
				fileName: file.path,
				showProperties: false
			}));
		}

		cb();
	});
};
