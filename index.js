'use strict';
var path = require('path');
var gutil = require('gulp-util');
var through = require('through2');
var applySourceMap = require('vinyl-sourcemaps-apply');
var objectAssign = require('object-assign');
var replaceExt = require('replace-ext');
var babel = require('babel-core');

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
			var isInputSourceMapPresent = Boolean(file.sourceMap);
			var defaultOpts = {
				filename: file.path,
				filenameRelative: file.relative
			};

			if (isInputSourceMapPresent) {
				defaultOpts.inputSourceMap = file.sourceMap;
			}
			else {
				defaultOpts.sourceFileName = file.relative;
				defaultOpts.sourceMapTarget = file.relative;
			}

			var fileOpts = objectAssign({}, opts, defaultOpts);

			var res = babel.transform(file.contents.toString(), fileOpts);

			if (file.sourceMap && res.map) {
				if (isInputSourceMapPresent) {
					file.sourceMap = res.map;
				}
				else {
					res.map.file = replaceExtension(res.map.file);
					applySourceMap(file, res.map);
				}
			}

			if (!res.ignored) {
				file.contents = new Buffer(res.code);
				file.path = replaceExtension(file.path);
			}

			file.babel = res.metadata;

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
