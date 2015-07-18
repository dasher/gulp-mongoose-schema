var through = require('through2'),
    gutil = require('gulp-util'),
    path = require('path'),
    merge = require('merge'),
    jsonic = require('jsonic')

var PluginError = gutil.PluginError;

module.exports = function (opt) {
    function replaceExtension(path) {
        path = path.replace(/\.json\.md$/, '.json');
        return gutil.replaceExtension(path, '.schema.json');
    }

    function transform(file, enc, cb) {
        if (file.isNull()) return cb(null, file);
        if (file.isStream()) return cb(new PluginError('gulp-mongoose-schema', 'Streaming not supported'));

        //console.log("Working with %j", file);

        var data;
        var str = file.contents.toString('utf8');
        var dest = replaceExtension(file.path);

        try {
            data = JSON.stringify(jsonic(str), null, 2);
        } catch (err) {
            return cb(new PluginError('gulp-mongoose-schema', err));
        }

        file.contents = new Buffer(data);

        file.path = dest;
        cb(null, file);
    }

    return through.obj(transform);
};
