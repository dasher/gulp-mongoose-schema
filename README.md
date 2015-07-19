# gulp-mongoose-schema


Work in progress

```JavaScript
gulp.task('schema',
    function(){
        var schema = require("gulp-mongoose-schema");

        return gulp.src(['source/*'])
            .pipe(schema())
            .pipe(gulp.dest('target/folder'))
            .pipe($.size({title: 'schema'}));
    }
)
```
