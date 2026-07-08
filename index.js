'use strict';
const path = require('path');
const PluginError = require('plugin-error');
const through = require('through2');
const applySourceMap = require('vinyl-sourcemaps-apply');
const replaceExt = require('replace-ext');
const babel = require('@babel/core');

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
			cb(new PluginError('gulp-babel', 'Streaming not supported'));
			return;
		}

		const fileOpts = Object.assign({}, opts, {
			filename: file.path,
			filenameRelative: file.relative,
			sourceMap: Boolean(file.sourceMap),
			sourceFileName: file.relative,
			caller: Object.assign(
				{name: 'babel-gulp'},
				opts.caller
			)
		});

		babel.transformAsync(file.contents.toString(), fileOpts).then(res => {
			if (res) {
				if (file.sourceMap && res.map) {
					res.map.file = replaceExtension(file.relative);
					applySourceMap(file, res.map);
				}

				file.contents = Buffer.from(res.code);
				file.path = replaceExtension(file.path);

				file.babel = res.metadata;
			}

			this.push(file);
		}).catch(error => {
			this.emit('error', new PluginError('gulp-babel', error, {
				fileName: file.path,
				showProperties: false
			}));
		}).then(
			() => cb(),
			() => cb()
		);
	});
};
