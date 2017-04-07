'use strict';
var path = require('path');
var gutil = require('gulp-util');
var through = require('through2');
var applySourceMap = require('vinyl-sourcemaps-apply');
var objectAssign = require('object-assign');
var replaceExt = require('replace-ext');
var babel = require('babel-core');
var lru = require('lru-cache');
var crypto = require('crypto');

function replaceExtension(fp) {
	return path.extname(fp) ? replaceExt(fp, '.js') : fp;
}

module.exports = function (lruOptions) {
	lruOptions = lruOptions || 500;

	var cache = lru(lruOptions);

	return function (opts) {
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
				var fileOpts = objectAssign({}, opts, {
					filename: file.path,
					filenameRelative: file.relative,
					sourceMap: Boolean(file.sourceMap),
					sourceFileName: file.relative,
					sourceMapTarget: file.relative
				});

				var resultHash = crypto.createHash('sha1').update(file.contents.toString()).digest('hex');

				var res;

				res = cache.get(resultHash);

				if (!res) {
					res = babel.transform(file.contents.toString(), fileOpts);

					cache.set(resultHash, res);
				}

				if (file.sourceMap && res.map) {
					res.map.file = replaceExtension(res.map.file);
					applySourceMap(file, res.map);
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
};
