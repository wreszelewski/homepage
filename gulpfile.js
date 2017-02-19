const gulp = require('gulp');
const cssnano = require('gulp-cssnano');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const awspublish = require('gulp-awspublish');


gulp.task('css', () =>
	gulp.src('./assets/css/*')
		.pipe(cssnano())
		.pipe(gulp.dest('./build/css'))
);

gulp.task('js', () =>
	gulp.src('./assets/js/*')
		.pipe(uglify())
		.pipe(gulp.dest('./build/js'))
);

gulp.task('images', () =>
	gulp.src('./assets/pic/*')
		.pipe(imagemin([
			imagemin.gifsicle(),
			imagemin.jpegtran({progressive: true, arithmetic: true}),
			imagemin.optipng(),
			imagemin.svgo()
		]))
		.pipe(gulp.dest('build/pic'))
);


gulp.task('fonts', () =>
	gulp.src('./assets/fonts/**/*')
		.pipe(gulp.dest('build/fonts'))
);

gulp.task('awsPush', () => {
	const publisher = awspublish.create({
		region: 'eu-west-1',
		params: {
			Bucket: 'static.reszelewski.com'
		}
	});

	const headers = {
		"Cache-Control": 'max-age=604800, public'
	}

	return gulp.src('./build/**/*')
		.pipe(publisher.publish(headers))
		.pipe(awspublish.reporter());
});

gulp.task('build', ['css', 'js', 'images', 'fonts']);
