'use strict';
const path = require('path');
const {Transform} = require('stream');
const PluginError = require('plugin-error');
const applySourceMap = require('vinyl-sourcemaps-apply');
const replaceExt = require('replace-ext');
const babel = require('@babel/core');

function replaceExtension(fp) {
	return path.extname(fp) ? replaceExt(fp, '.js') : fp;
}

module.exports = function (opts) {
	opts = opts || {};

	const stream = new Transform({
		objectMode: true,
		autoDestroy: false,
		transform(file, enc, cb) {
			if (file.isNull()) {
				cb(null, file);
				return;
			}

			if (file.isStream()) {
				this.emit('error', new PluginError('gulp-babel', 'Streaming not supported'));
				cb();
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
		}
	});

	// Keep the destroy() behaviour gulp-babel had with through2@3
	stream.destroy = function (err) {
		if (this._destroyed) {
			return;
		}

		this._destroyed = true;
		process.nextTick(() => {
			if (err) {
				this.emit('error', err);
			}

			this.emit('close');
		});
	};

	return stream;
};
