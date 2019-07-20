var gulp = require("gulp");
let cleanCSS = require("gulp-clean-css");
var concat = require("gulp-concat");
const minify = require("gulp-babel-minify");
var uglify = require("gulp-uglify");
var htmlmin = require('gulp-htmlmin');
const del = require('del');
const babel = require('gulp-babel');

gulp.task("pack-css", () =>
    gulp.
    src("css/*.css").
    pipe(concat("bundlecss.css")).
    pipe(cleanCSS()).
    pipe(gulp.dest("dist/css"))
);

gulp.task("pack-js", () =>
    gulp.
    src([
        "js/dbhelper.js",
        "js/main.js"
    ]).
    pipe(concat("bundle.js")).
    pipe(minify({mangle: {keepClassName: true}})).
    pipe(gulp.dest("dist/js"))
);

gulp.task('minify', function() {
    return gulp.src('*.html')
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest('dist'));
});


gulp.task('sw', () => {
    return gulp.src('sw.js')
        .pipe(babel({
            plugins: [
                ['transform-es2015-arrow-functions', { 'spec': true }]
            ],
            presets: ['@babel/env']
        }))
        .pipe(uglify({}))
        .on('error', (err) => {
            gutil.log(gutil.colors.red('[Error]'), err.toString());
        })
        .pipe(gulp.dest('dist/'));
});


gulp.task('clean', function () {
    return del.sync([
        'dist'
    ]);
});

gulp.task('default', ['clean'], function () {
    gulp.start('pack-css');
    gulp.start('minify');
    gulp.start('sw');
});