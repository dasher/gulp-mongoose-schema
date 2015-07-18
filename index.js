var through = require('through2'),
    gutil = require('gulp-util'),
    path = require('path'),
    merge = require('merge'),
    jsonic = require('jsonic');

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
            data = jsonic(str);
        } catch (err) {
            return cb(new PluginError('gulp-mongoose-schema', err));
        }

        var moment = require("moment");
        var dateFormatter = require("moment-parseformat");

        /*
        d = moment(s, 'ddd MMM DD H:mm:ss ZZ YYYY')
        s = 'Mon Jun 02 10:52:59 +0000 2008';
        */

        var dateFormats = [
            'ddd MMM DD H:mm:ss ZZ YYYY',
            'M/d/yyyy',
            'dddd, MMMM dd, yyyy',
            'dddd, MMMM dd, yyyy h:mm:ss tt',
            'MMMM dd',
            'ddd, dd MMM yyyy HH:mm:ss GMT',
            'yyyy-MM-ddTHH:mm:ss',
            'h:mm tt',
            'h:mm:ss tt',
            'yyyy-MM-dd HH:mm:ssZ',
            'MMMM, yyyy'
        ];

        // We have the data - process into data types
        require("sugar");
        var targetSchema = {};
        for (key in data) {
            var dataValue = data[key];
            var dataType = (typeof dataValue);
            var isArray = Array.isArray(dataValue);

            if (isArray) {
                targetSchema[key] = "Array";
            } else {
                if (dataType == 'object') {
                    targetSchema[key] = 'Mixed';
                } else {
                    var guessedFormat = dateFormatter(dataValue+'') || '';
                    console.log("[%s:%j] format guess %s", key, dataValue, guessedFormat);
                    var dateFormatGuess =  moment(dataValue, dateFormats, true);
                    if (dateFormatGuess.isValid()) {
                        targetSchema[key] = "Date";
                    } else {
                        targetSchema[key] = dataType.camelize();
                    }
                }
            }
        }

        file.contents = new Buffer(JSON.stringify(targetSchema), null, 2);

        file.path = dest;
        cb(null, file);
    }

    return through.obj(transform);
};
