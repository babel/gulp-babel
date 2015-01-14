'use strict';
var gutil = require('gulp-util');
var through = require('through2');
var applySourceMap = require('vinyl-sourcemaps-apply');
var objectAssign = require('object-assign');
var to5 = require('6to5-core');

module.exports = function (opts) {
	opts = opts || {};

	return through.obj(function (file, enc, cb) {
		if (file.isNull()) {
			cb(null, file);
			return;
		}

		if (file.isStream()) {
			cb(new gutil.PluginError('gulp-6to5', 'Streaming not supported'));
			return;
		}

		try {
			var fileOpts = objectAssign({}, opts, {
				filename: file.path,
				filenameRelative: file.relative,
				sourceMap: !!file.sourceMap
			});

			var res = to5.transform(file.contents.toString(), fileOpts);

			if (file.sourceMap && res.map) {
				applySourceMap(file, res.map);
			}

			file.contents = new Buffer(res.code);
			this.push(file);
		} catch (err) {
			this.emit('error', new gutil.PluginError('gulp-6to5', err, {fileName: file.path}));
		}

		cb();
	});
};
