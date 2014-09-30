'use strict';
var gutil = require('gulp-util');
var through = require('through2');
var to5 = require('6to5');
var applySourceMap = require('vinyl-sourcemaps-apply');
var objectAssign = require('object-assign');
var convertSourceMap = require('convert-source-map');

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
				//sourceMap: !!file.sourceMap
			});

			var res = to5.transform(file.contents.toString(), fileOpts);

			// TODO: 5to6 returns empty source map
			// if (file.sourceMap) {
			// 	applySourceMap(file, convertSourceMap.fromSource(res).toObject());
			//	res = convertSourceMap.removeComments(res);
			// }

			file.contents = new Buffer(res);
			this.push(file);
		} catch (err) {
			this.emit('error', new gutil.PluginError('gulp-6to5', err, {fileName: file.path}));
		}

		cb();
	});
};
