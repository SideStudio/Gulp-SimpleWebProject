/************************************************************************************
 * Gulp Plugin List
 ************************************************************************************/
var gulp = require('gulp'), // gulp lib
    del = require('del'),  // file and directory deleted
    gutil = require('gulp-util'), // gulp.log and etc...
    inquirer = require('inquirer'), // console window prompt custom lib

    // 코드 압축 라이브 러리.
    uglify = require('gulp-uglify'), // js min
    minifyCss = require('gulp-minify-css'), // css min

    // 코드 품질 검사 라이브러리.
    jshint = require('gulp-jshint'), // js code check lib
    htmlhint = require('gulp-htmlhint'), // html code check lib
    csslint = require('gulp-csslint'), // css code check lib

    // 실시간 브라우저 변경 및 서버 구동 라이브러리.
    browserSync = require('browser-sync'), // local server lib
    reload = browserSync.reload;

var profile = {
    // 개발용 profile
    'dev': {
        'baseDir': './public/src/',
        'jsPath': './public/src/js/**/*.js',
        'cssPath': './public/src/css/**/*.css',
        'htmlPath': './public/src/**/*.html',
        'vendorPath': './public/src/vendor/**/*',
        'port': 3000
    },

    // 배포용 profile
    'build': {
        'baseDir': './build/',
        'cleanDir': './build/**/*',
        'jsDir': './build/js/',
        'cssDir': './build/css/',
        'htmlDir': './build/',
        'vendorDir': './build/vendor',
        'jsPath': './build/js/**/*.js',
        'cssPath': './build/css/**/*.css',
        'htmlPath': './build/**/*.html',
        'port': 8000
    }
};


/************************************************************************************
 * Dev Tasks
 ************************************************************************************/

// DEV js files Task
gulp.task('dev:scripts', function() {

    gutil.log(gutil.colors.green('===== JS Code Quality Inspection ======'));

    gulp.src([profile.dev.jsPath])
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(reload({stream:true}));
});

// DEV css files Task
gulp.task('dev:css', function() {

    gutil.log(gutil.colors.green('===== CSS Code Quality Inspection ======'));

    gulp.src([profile.dev.cssPath])
        .pipe(csslint())
        .pipe(csslint.reporter())
        .pipe(reload({stream:true}));
});

// DEV html files Task
gulp.task('dev:html', function() {

    gutil.log(gutil.colors.green('===== HTML Code Quality Inspection ====='));

    gulp.src([profile.dev.htmlPath])
        .pipe(htmlhint())
        .pipe(htmlhint.reporter('htmlhint-stylish'))
        .pipe(reload({stream:true}));
});

// DEV watch Task
gulp.task('dev:watch', function() {

    gutil.log(gutil.colors.green('===== Gulp Watch Process On ====='));

    gulp.watch(profile.dev.jsPath, ['dev:scripts']);
    gulp.watch(profile.dev.cssPath, ['dev:css']);
    gulp.watch(profile.dev.htmlPath, ['dev:html']);
});

// DEV browser-sync Task
gulp.task('dev:server', ['dev:scripts', 'dev:css', 'dev:html', 'dev:watch'], function() {

    gutil.log(gutil.colors.green('===== Dev Server On ====='));

    browserSync({
        port : profile.dev.port,
        server:{
            baseDir: profile.dev.baseDir
        }
    });
});

/************************************************************************************
 * Build Tasks
 ************************************************************************************/

// 빌드 clean Task
gulp.task('build:clean', function() {

    gutil.log(gutil.colors.green('===== Build Files Clean ======'));

    del.sync([profile.build.cleanDir]);
});

// 빌드 js 파일 Task
gulp.task('build:scripts', function() {

    gutil.log(gutil.colors.green('===== JS Code Quality Inspection ======'));

    var stream = gulp.src([profile.dev.jsPath])
                     .pipe(jshint())
                     .pipe(jshint.reporter('jshint-stylish'))
                     .pipe(uglify())
                     .pipe(gulp.dest(profile.build.jsDir))
                     .pipe(reload({stream:true}));

    //return stream;
});

// 빌드 css 파일 Task
gulp.task('build:css', function() {

    gutil.log(gutil.colors.green('===== CSS Code Quality Inspection ======'));

    var stream = gulp.src([profile.dev.cssPath])
                 .pipe(csslint())
                 .pipe(csslint.reporter())
                 .pipe(minifyCss())
                 .pipe(gulp.dest(profile.build.cssDir))
                 .pipe(reload({stream:true}));

    //return stream;
});

// 빌드 html 파일 Task
gulp.task('build:html', function() {

    gutil.log(gutil.colors.green('===== HTML Code Quality Inspection ======'));

    var stream = gulp.src([profile.dev.htmlPath])
                     .pipe(htmlhint())
                     .pipe(htmlhint.reporter('htmlhint-stylish'))
                     .pipe(gulp.dest(profile.build.htmlDir))
                     .pipe(reload({stream:true}));

    //return stream;
});

// 빌드 vendor 파일 복사
gulp.task('build:vendor', function() {

    gutil.log(gutil.colors.green('===== vendor library files Copy ======'));

    var stream = gulp.src([profile.dev.vendorPath])
                     .pipe(gulp.dest(profile.build.vendorDir));

    //return stream;
});

// 빌드 watch Task
gulp.task('build:watch', function() {

    gutil.log(gutil.colors.green('===== Gulp Watch Process On ====='));

    gulp.watch(profile.build.jsPath, ['build:scripts']);
    gulp.watch(profile.build.cssPath, ['build:css']);
    gulp.watch(profile.build.htmlPath, ['build:html']);
});

// 빌드 browser-sync Task
gulp.task('build:server', ['build:watch'], function() {

    gutil.log(gutil.colors.green('===== Build Server On ====='));

    browserSync({

        port : profile.build.port,
        server:{
            baseDir: profile.build.baseDir,
            index: 'index.html'
        }
    });
});

// 빌드 배포용 소스 변환 Task
gulp.task('build', ['build:clean', 'build:scripts', 'build:css', 'build:html', 'build:vendor'], function() {

});

// 배포후 서버 ON
gulp.task('build:run', ['build', 'build:server'], function() {

});

gulp.task('default', function() {

    var buildList = [
        {
            type: "list",
            name: "task_type",
            message: "원하는 Task를 선택하세요.",
            choices: [
                {
                    name: "개발버전 서버 ON",
                    value: "dev:server"
                },
                {
                    name: "배포버전 서버 ON",
                    value: "build:server"
                },
                new inquirer.Separator(),
                {
                    name: "빌드 하기",
                    value: "build"
                },
                {
                    name: "빌드 후 서버 실행",
                    value: "build:run"
                }
            ]
        }
    ];

    inquirer.prompt( buildList, function( answers ) {

        console.log(answers.task_type);

        task_name = answers.task_type;

        gulp.run(task_name);
    });

});
